const { Router } = require("express");
const router = Router({ mergeParams: true });
const { trim } = require("../util/common.util");
const LeadAutomationService = require("../services/lead_automation.service");

const normalizeRegisteredVia = (registeredVia) => {
    if (!registeredVia) return '';
    const raw = Array.isArray(registeredVia) ? registeredVia.join(',') : String(registeredVia);
    const parts = raw
        .split(',')
        .map((s) => String(s || '').trim())
        .filter(Boolean)
        .map((s) => s.toUpperCase());
    return parts.join(',');
};

class LeadAutomationCtrl {
    static list = async (req, res) => {
        try {
            const { page, page_size, search, status } = trim(req.query || {});
            const result = await LeadAutomationService.listAutomations({
                page: page ? Number(page) : undefined,
                pageSize: page_size ? Number(page_size) : undefined,
                search: search || undefined,
                status: typeof status !== 'undefined' ? status : undefined,
            });
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }

    static getOne = async (req, res) => {
        try {
            const { id } = req.params || {};
            const result = await LeadAutomationService.getAutomationById(id);
            if (!result) {
                return res.status(404).json({ message: 'Automation not found' });
            }
            return res.status(200).json({ message: '', result });
        } catch (e) {
            return res.status(400).json({ message: e.message || 'Error' });
        }
    }
    static create = async (req, res) => {
        try {
            const { 
                name, 
                strategy, 
                registered_via, 
                discipline_id, 
                course_id, 
                filters_json, 
                priority, 
                status, 
                description,
                agents
            } = trim(req.body || {});

            // Validate required fields
            if (!name || !strategy) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const normalizedStrategy = String(strategy).trim().toLowerCase().replace(/\s+/g, '_');
            console.log('CREATE - Received strategy:', strategy, '-> normalizedStrategy:', normalizedStrategy); // Debug log
            if (!['dataset', 'country', 'discipline', 'round_robin'].includes(normalizedStrategy)) {
                return res.status(400).json({ message: 'Invalid strategy' });
            }

            const normalizedRegisteredVia = normalizeRegisteredVia(registered_via);
            // Dataset can be configured without registered_via to mean "all".
            if (!normalizedRegisteredVia && normalizedStrategy !== 'dataset') {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // IMPORTANT: DB schema may not yet allow `dataset` and `round_robin` in strategy enum.
            // Persist as legacy values while keeping UI/logic treating them differently.
            // dataset -> country, round_robin -> discipline
            let strategyToSave = normalizedStrategy;
            if (normalizedStrategy === 'dataset') {
                strategyToSave = 'country';
            } else if (normalizedStrategy === 'round_robin') {
                strategyToSave = 'discipline';
            }
            console.log('CREATE - strategyToSave:', strategyToSave); // Debug log

            const automationData = {
                name,
                strategy: strategyToSave,
                // DB column may only support single value; store full selection in filters_json.
                registered_via: normalizedRegisteredVia ? String(normalizedRegisteredVia).split(',')[0] : '',
                discipline_id: Array.isArray(discipline_id) ? discipline_id.join(',') : discipline_id,
                course_id: Array.isArray(course_id) ? course_id.join(',') : course_id,
                filters_json: typeof filters_json === 'string' ? JSON.parse(filters_json) : filters_json,
                priority: priority || 100,
                status: status !== undefined ? status : 1,
                description: description || '',
                agents: agents || []
            };

            // Persist multi-select values into filters_json so they are not lost in numeric DB columns.
            // Some DB schemas store discipline_id/course_id as numeric, which would truncate "1,2" -> 1.
            const disciplineIds = LeadAutomationService.normalizeIdList(automationData.discipline_id);
            const courseIds = LeadAutomationService.normalizeIdList(automationData.course_id);
            const fj = (automationData.filters_json && typeof automationData.filters_json === 'object')
                ? { ...automationData.filters_json }
                : {};
            if (disciplineIds.length) fj.discipline_ids = disciplineIds;
            if (courseIds.length) fj.course_ids = courseIds;
            if (normalizedRegisteredVia) fj.registered_via = String(normalizedRegisteredVia).split(',').filter(Boolean);
            automationData.filters_json = fj;

            // Keep legacy numeric columns as first id only (for compatibility with joins)
            automationData.discipline_id = disciplineIds[0] || 0;
            automationData.course_id = courseIds[0] || 0;

            const result = await LeadAutomationService.createAutomation(automationData, req);
            return res.status(201).json({ message: 'Automation created successfully', result });
        } catch (e) {
            console.error('Error creating automation:', e);
            return res.status(400).json({ message: e.message || 'Error creating automation' });
        }
    }

    static update = async (req, res) => {
        try {
            const { id } = req.params || {};
            const { 
                name, 
                strategy, 
                registered_via, 
                discipline_id, 
                course_id, 
                filters_json, 
                priority, 
                status, 
                description,
                agents
            } = trim(req.body || {});

            console.log('Controller update - Raw body:', req.body); // Debug log
            console.log('Controller update - filters_json:', filters_json, typeof filters_json); // Debug log

            const normalizedStrategy = String(strategy).trim().toLowerCase().replace(/\s+/g, '_');
            console.log('UPDATE - Received strategy:', strategy, '-> normalizedStrategy:', normalizedStrategy); // Debug log
            if (!['dataset', 'country', 'discipline', 'round_robin'].includes(normalizedStrategy)) {
                return res.status(400).json({ message: 'Invalid strategy' });
            }

            const normalizedRegisteredVia = normalizeRegisteredVia(registered_via);
            // Dataset can be configured without registered_via to mean "all".
            if (!normalizedRegisteredVia && normalizedStrategy !== 'dataset') {
                return res.status(400).json({ message: 'registered_via required' });
            }

            // IMPORTANT: DB schema may not yet allow `dataset` and `round_robin` in strategy enum.
            // Persist as legacy values while keeping UI/logic treating them differently.
            // dataset -> country, round_robin -> discipline
            let strategyToSave = normalizedStrategy;
            if (normalizedStrategy === 'dataset') {
                strategyToSave = 'country';
            } else if (normalizedStrategy === 'round_robin') {
                strategyToSave = 'discipline';
            }
            console.log('UPDATE - strategyToSave:', strategyToSave); // Debug log

            const automationData = {
                name,
                strategy: strategyToSave,
                registered_via: normalizedRegisteredVia ? String(normalizedRegisteredVia).split(',')[0] : '',
                discipline_id: Array.isArray(discipline_id) ? discipline_id.join(',') : discipline_id,
                course_id: Array.isArray(course_id) ? course_id.join(',') : course_id,
                filters_json: typeof filters_json === 'string' ? JSON.parse(filters_json) : filters_json,
                priority: priority || 100,
                status: status !== undefined ? status : 1,
                description: description || '',
                agents: agents || []
            };

            // Persist multi-select values into filters_json so they are not lost in numeric DB columns.
            const disciplineIds = LeadAutomationService.normalizeIdList(automationData.discipline_id);
            const courseIds = LeadAutomationService.normalizeIdList(automationData.course_id);
            const fj = (automationData.filters_json && typeof automationData.filters_json === 'object')
                ? { ...automationData.filters_json }
                : {};
            if (disciplineIds.length) fj.discipline_ids = disciplineIds;
            if (courseIds.length) fj.course_ids = courseIds;
            if (normalizedRegisteredVia) fj.registered_via = String(normalizedRegisteredVia).split(',').filter(Boolean);
            automationData.filters_json = fj;

            automationData.discipline_id = disciplineIds[0] || 0;
            automationData.course_id = courseIds[0] || 0;

            console.log('Controller update - Processed automationData:', automationData); // Debug log

            const result = await LeadAutomationService.updateAutomation(id, automationData, req);
            return res.status(200).json({ message: 'Automation updated successfully', result });
        } catch (e) {
            console.error('Error updating automation:', e);
            return res.status(400).json({ message: e.message || 'Error updating automation' });
        }
    }

    static delete = async (req, res) => {
        try {
            const { id } = req.params || {};
            if (!id) {
                return res.status(400).json({ message: 'Automation ID is required' });
            }

            const result = await LeadAutomationService.deleteAutomation(id);
            return res.status(200).json({ message: 'Automation deleted successfully', result });
        } catch (e) {
            console.error('Error deleting automation:', e);
            return res.status(400).json({ message: e.message || 'Error deleting automation' });
        }
    }
}

router.get('/', LeadAutomationCtrl.list);
router.get('/:id', LeadAutomationCtrl.getOne);
router.post('/', LeadAutomationCtrl.create);
router.put('/:id', LeadAutomationCtrl.update);
router.delete('/:id', LeadAutomationCtrl.delete); 

module.exports = router;
