require('dotenv').config();
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  }
});

async function setupTables() {
  try {
    console.log('--- 1. Creating appengine_forms table if not exists ---');
    const hasAppengineForms = await knex.schema.hasTable('appengine_forms');
    if (!hasAppengineForms) {
      await knex.schema.createTable('appengine_forms', (table) => {
        table.increments('id').primary();
        table.string('form_name', 255).notNullable();
        table.string('form_title', 255).nullable();
        table.text('form_description').nullable();
        table.string('form_slug', 255).nullable();
        table.string('status', 50).defaultTo('active');
        table.tinyint('is_default', 1).defaultTo(0);
        table.json('settings').nullable();
        table.integer('created_by').nullable();
        table.datetime('created_at').defaultTo(knex.fn.now());
        table.datetime('updated_at').defaultTo(knex.fn.now());
      });
      console.log('Created appengine_forms table successfully.');
    } else {
      console.log('appengine_forms table already exists.');
    }

    console.log('--- 2. Checking form_sections columns ---');
    const [sectionCols] = await knex.raw('DESCRIBE form_sections');
    const sectionColNames = sectionCols.map(c => c.Field);
    
    await knex.schema.table('form_sections', (table) => {
      if (!sectionColNames.includes('form_id')) {
        table.integer('form_id').nullable().after('id');
      }
      if (!sectionColNames.includes('section_key')) {
        table.string('section_key', 100).nullable().after('section_name');
      }
      if (!sectionColNames.includes('icon')) {
        table.string('icon', 100).nullable().after('section_name');
      }
      if (!sectionColNames.includes('description')) {
        table.string('description', 255).nullable();
      }
      if (!sectionColNames.includes('config')) {
        table.json('config').nullable();
      }
      if (!sectionColNames.includes('created_at')) {
        table.datetime('created_at').defaultTo(knex.fn.now());
      }
      if (!sectionColNames.includes('updated_at')) {
        table.datetime('updated_at').defaultTo(knex.fn.now());
      }
    });
    console.log('form_sections updated.');

    console.log('--- 3. Checking form_fields columns ---');
    const [fieldCols] = await knex.raw('DESCRIBE form_fields');
    const fieldColNames = fieldCols.map(c => c.Field);

    await knex.schema.table('form_fields', (table) => {
      if (!fieldColNames.includes('section_id')) {
        table.integer('section_id').nullable().after('form_id');
      }
      if (!fieldColNames.includes('group_title')) {
        table.string('group_title', 255).nullable().after('section_id');
      }
      if (!fieldColNames.includes('help_text')) {
        table.string('help_text', 255).nullable();
      }
      if (!fieldColNames.includes('conditional_rules')) {
        table.json('conditional_rules').nullable();
      }
      if (!fieldColNames.includes('table_columns')) {
        table.json('table_columns').nullable();
      }
      if (!fieldColNames.includes('field_config')) {
        table.json('field_config').nullable();
      }
      if (!fieldColNames.includes('updated_at')) {
        table.datetime('updated_at').defaultTo(knex.fn.now());
      }
    });
    console.log('form_fields updated.');

    console.log('--- 4. Verify/Seed default App Engine Form ---');
    let defaultForm = await knex('appengine_forms').where({ is_default: 1 }).first();
    if (!defaultForm) {
      const [formId] = await knex('appengine_forms').insert({
        form_name: 'Standard Scholarship Application Form',
        form_title: 'APPLICATION FORM',
        form_description: 'Dynamic multi-tab application form engine',
        form_slug: 'scholarship-application-form',
        status: 'active',
        is_default: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('Inserted default appengine_forms record with ID:', formId);
      defaultForm = { id: formId };
    }

    // Check existing sections and update their form_id, keys, and icons if null
    const sections = await knex('form_sections').select('*');
    for (const sec of sections) {
      let icon = 'fa-file-alt';
      let section_key = 'section_' + sec.id;
      if (sec.section_name.includes('Basic Information')) {
        icon = 'fa-address-card';
        section_key = 'basic_info';
      } else if (sec.section_name.includes('Educational')) {
        icon = 'fa-university';
        section_key = 'edu_info';
      } else if (sec.section_name.includes('Background')) {
        icon = 'fa-newspaper';
        section_key = 'bg_info';
      } else if (sec.section_name.includes('Student Choice') || sec.section_name.includes('Choice Fill')) {
        icon = 'fa-hand-pointer';
        section_key = 'choice_fill';
      }

      await knex('form_sections').where({ id: sec.id }).update({
        form_id: sec.form_id || defaultForm.id,
        section_key: sec.section_key || section_key,
        icon: sec.icon || icon,
        is_active: sec.is_active !== null ? sec.is_active : 1,
        step_order: sec.step_order || sec.id
      });
    }

    console.log('Database tables configuration finished successfully.');
  } catch (err) {
    console.error('Setup error:', err);
  } finally {
    await knex.destroy();
  }
}

setupTables();
