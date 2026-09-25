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

async function seedFields() {
  try {
    const form = await knex('appengine_forms').where({ is_default: 1 }).first();
    const formId = form ? form.id : 1;

    // Check if fields for this form already seeded
    const count = await knex('form_fields').where({ form_id: formId }).count('* as total').first();
    console.log(`Current form_fields count for form_id ${formId}:`, count.total);

    // If count is less than 15, let's seed the comprehensive set of screenshot fields
    // First retrieve sections
    const basicSec = await knex('form_sections').where({ section_key: 'basic_info' }).orWhere('section_name', 'like', '%Basic%').first();
    const eduSec = await knex('form_sections').where({ section_key: 'edu_info' }).orWhere('section_name', 'like', '%Educational%').first();
    const bgSec = await knex('form_sections').where({ section_key: 'bg_info' }).orWhere('section_name', 'like', '%Background%').first();
    const choiceSec = await knex('form_sections').where({ section_key: 'choice_fill' }).orWhere('section_name', 'like', '%Choice%').first();

    const basicSecId = basicSec ? basicSec.id : 1;
    const eduSecId = eduSec ? eduSec.id : 2;
    const bgSecId = bgSec ? bgSec.id : 3;
    const choiceSecId = choiceSec ? choiceSec.id : 4;

    const fieldsToInsert = [
      // --- TAB 1: Basic Information ---
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: null,
        label: 'First Name',
        field_name: 'first_name',
        field_type: 'text',
        placeholder: 'Enter First Name',
        default_value: 'Aditya',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 1,
        validation_rules: JSON.stringify({ min: 2, max: 50 }),
        options: null
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: null,
        label: 'Last Name',
        field_name: 'last_name',
        field_type: 'text',
        placeholder: 'Enter Last Name',
        default_value: 'Pandey',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 2,
        validation_rules: JSON.stringify({ min: 2, max: 50 }),
        options: null
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: null,
        label: 'Email',
        field_name: 'email',
        field_type: 'email',
        placeholder: 'Enter Email Address',
        default_value: 'adityapandey9977@gmail.com',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 3,
        validation_rules: JSON.stringify({ email: true }),
        options: JSON.stringify({ verified_badge: true })
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: null,
        label: 'Gender',
        field_name: 'gender',
        field_type: 'select',
        placeholder: 'Select Gender',
        default_value: 'Male',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 4,
        options: JSON.stringify([
          { label: 'Male', value: 'Male' },
          { label: 'Female', value: 'Female' },
          { label: 'Other', value: 'Other' }
        ])
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: null,
        label: 'Date of Birth',
        field_name: 'dob',
        field_type: 'date',
        placeholder: 'Select Date of Birth',
        default_value: '1994-09-18',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 5,
        options: null
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: null,
        label: 'Country',
        field_name: 'country',
        field_type: 'select',
        placeholder: 'Select Country',
        default_value: '(NRI Student) India',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 6,
        options: JSON.stringify([
          { label: '(NRI Student) India', value: '(NRI Student) India' },
          { label: 'United Arab Emirates', value: 'United Arab Emirates' },
          { label: 'Saudi Arabia', value: 'Saudi Arabia' },
          { label: 'Oman', value: 'Oman' },
          { label: 'Kuwait', value: 'Kuwait' }
        ])
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: null,
        label: 'Father Name',
        field_name: 'father_name',
        field_type: 'text',
        placeholder: 'Enter Father Name',
        default_value: 'Bhaskar Pandey',
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 7,
        options: null
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: null,
        label: 'Mother Name',
        field_name: 'mother_name',
        field_type: 'text',
        placeholder: 'Enter Mother Name',
        default_value: 'Sudha Pandey',
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 8,
        options: null
      },
      // Group: Course of Interest
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: 'Course of Interest',
        label: 'Academic Career',
        field_name: 'academic_career',
        field_type: 'select',
        placeholder: 'Select Academic Career',
        default_value: 'Undergraduate',
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 9,
        options: JSON.stringify([
          { label: 'Undergraduate', value: 'Undergraduate' },
          { label: 'Postgraduate', value: 'Postgraduate' },
          { label: 'Doctorate', value: 'Doctorate' }
        ])
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: 'Course of Interest',
        label: 'Discipline',
        field_name: 'discipline',
        field_type: 'select',
        placeholder: 'Select Discipline',
        default_value: 'Computer Application',
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 10,
        options: JSON.stringify([
          { label: 'Computer Application', value: 'Computer Application' },
          { label: 'Engineering & Technology', value: 'Engineering & Technology' },
          { label: 'Business & Management', value: 'Business & Management' },
          { label: 'Medical & Allied Sciences', value: 'Medical & Allied Sciences' }
        ])
      },
      // Group: Contact Details
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: 'Contact Details',
        label: 'Country Code',
        field_name: 'country_code',
        field_type: 'select',
        placeholder: 'Select Country Code',
        default_value: '+91 (NRI Student) India',
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 11,
        options: JSON.stringify([
          { label: '+91 (NRI Student) India', value: '+91' },
          { label: '+971 UAE', value: '+971' },
          { label: '+966 Saudi Arabia', value: '+966' },
          { label: '+968 Oman', value: '+968' }
        ])
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: 'Contact Details',
        label: 'Mobile No. (Whatsapp)',
        field_name: 'mobile_no',
        field_type: 'tel',
        placeholder: 'Enter Mobile / WhatsApp Number',
        default_value: '9977779341',
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 12,
        options: null
      },
      // Group: Resident Details
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: 'Resident Details',
        label: 'Address',
        field_name: 'address',
        field_type: 'text',
        placeholder: 'Enter Residential Address',
        default_value: '107, Schme',
        is_required: 1,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 13,
        options: null
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: 'Resident Details',
        label: 'Country',
        field_name: 'resident_country',
        field_type: 'select',
        placeholder: 'Select Country',
        default_value: '(NRI Student) India',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 14,
        options: JSON.stringify([
          { label: '(NRI Student) India', value: '(NRI Student) India' },
          { label: 'United Arab Emirates', value: 'United Arab Emirates' },
          { label: 'Saudi Arabia', value: 'Saudi Arabia' }
        ])
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: 'Resident Details',
        label: 'State',
        field_name: 'state',
        field_type: 'select',
        placeholder: 'Select State',
        default_value: 'Madhya Pradesh',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 15,
        options: JSON.stringify([
          { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
          { label: 'Maharashtra', value: 'Maharashtra' },
          { label: 'Delhi', value: 'Delhi' },
          { label: 'Dubai', value: 'Dubai' }
        ])
      },
      {
        form_id: formId,
        section_id: basicSecId,
        group_title: 'Resident Details',
        label: 'City',
        field_name: 'city',
        field_type: 'select',
        placeholder: 'Select City',
        default_value: 'Indore',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 16,
        options: JSON.stringify([
          { label: 'Indore', value: 'Indore' },
          { label: 'Bhopal', value: 'Bhopal' },
          { label: 'Mumbai', value: 'Mumbai' },
          { label: 'Dubai City', value: 'Dubai City' }
        ])
      },

      // --- TAB 2: Educational Info/Documents ---
      {
        form_id: formId,
        section_id: eduSecId,
        group_title: null,
        label: 'Educational Qualifications',
        field_name: 'qualifications_table',
        field_type: 'table',
        placeholder: null,
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 1,
        table_columns: JSON.stringify([
          { key: 'sn', label: 'SN', type: 'index', width: '50px' },
          { key: 'qualification', label: 'QUALIFICATION', type: 'text', required: true },
          { key: 'result_status', label: 'RESULT STATUS', type: 'select', options: ['Declared', 'Awaited'], required: true },
          { key: 'passing_year', label: 'PASSING YEAR', type: 'number', required: true },
          { key: 'marks', label: 'MARKS', type: 'number', required: true },
          { key: 'document', label: 'DOCUMENT (IMAGE ONLY)', type: 'file', required: true }
        ]),
        default_value: JSON.stringify([
          {
            sn: 1,
            qualification: 'Secondary School / Class X / O Level / Equivalent Qualification',
            result_status: 'Declared',
            passing_year: '2017',
            marks: '400',
            document: 'preview_v.png'
          },
          {
            sn: 2,
            qualification: 'Higher Secondary / Class XII / A level / Equivalent Qualification',
            result_status: 'Declared',
            passing_year: '2019',
            marks: '402',
            document: 'preview_g.png'
          }
        ])
      },
      {
        form_id: formId,
        section_id: eduSecId,
        group_title: null,
        label: 'Document Upload Status Alert',
        field_name: 'edu_upload_alert',
        field_type: 'alert',
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 2,
        options: JSON.stringify({
          alert_type: 'success',
          icon: 'fa-check-circle',
          text: 'Document uploaded on 22 Jun 2026 @ 12:40 PM'
        })
      },
      {
        form_id: formId,
        section_id: eduSecId,
        group_title: null,
        label: 'Verification Status Alert',
        field_name: 'edu_verification_alert',
        field_type: 'alert',
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 3,
        options: JSON.stringify({
          alert_type: 'warning',
          icon: 'fa-exclamation-circle',
          text: 'Verification pending!'
        })
      },

      // --- TAB 3: Background Information ---
      {
        form_id: formId,
        section_id: bgSecId,
        group_title: null,
        label: 'Do you have a valid passport?',
        field_name: 'has_valid_passport',
        field_type: 'radio',
        default_value: 'Yes',
        is_required: 1,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 1,
        options: JSON.stringify([
          { label: 'Yes', value: 'Yes' },
          { label: 'No', value: 'No' }
        ])
      },
      {
        form_id: formId,
        section_id: bgSecId,
        group_title: null,
        label: 'Name As Per Passport',
        field_name: 'passport_name',
        field_type: 'text',
        placeholder: 'Enter Name As Per Passport',
        default_value: 'Aditya Pandey',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 2,
        conditional_rules: JSON.stringify({ dependsOn: 'has_valid_passport', value: 'Yes' })
      },
      {
        form_id: formId,
        section_id: bgSecId,
        group_title: null,
        label: 'Passport Number',
        field_name: 'passport_number',
        field_type: 'text',
        placeholder: 'Enter Passport Number',
        default_value: '123456123',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 3,
        conditional_rules: JSON.stringify({ dependsOn: 'has_valid_passport', value: 'Yes' })
      },
      {
        form_id: formId,
        section_id: bgSecId,
        group_title: null,
        label: 'Issuing Authority',
        field_name: 'issuing_authority',
        field_type: 'text',
        placeholder: 'Enter Issuing Authority',
        default_value: 'India',
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 4,
        conditional_rules: JSON.stringify({ dependsOn: 'has_valid_passport', value: 'Yes' })
      },
      {
        form_id: formId,
        section_id: bgSecId,
        group_title: null,
        label: 'Passport Expiry Date',
        field_name: 'passport_expiry_date',
        field_type: 'date',
        placeholder: 'Select Passport Expiry Date',
        default_value: '2030-06-01',
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 5,
        conditional_rules: JSON.stringify({ dependsOn: 'has_valid_passport', value: 'Yes' })
      },
      {
        form_id: formId,
        section_id: bgSecId,
        group_title: null,
        label: 'Passport Issue Country',
        field_name: 'passport_issue_country',
        field_type: 'select',
        placeholder: 'Select Passport Issue Country',
        default_value: '(NRI Student) India',
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 6,
        conditional_rules: JSON.stringify({ dependsOn: 'has_valid_passport', value: 'Yes' }),
        options: JSON.stringify([
          { label: '(NRI Student) India', value: '(NRI Student) India' },
          { label: 'United Arab Emirates', value: 'United Arab Emirates' },
          { label: 'Other', value: 'Other' }
        ])
      },
      {
        form_id: formId,
        section_id: bgSecId,
        group_title: null,
        label: 'Do you have a Citizenship number?',
        field_name: 'has_citizenship',
        field_type: 'radio',
        default_value: 'Yes',
        is_required: 1,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 7,
        options: JSON.stringify([
          { label: 'Yes', value: 'Yes' },
          { label: 'No', value: 'No' }
        ])
      },
      {
        form_id: formId,
        section_id: bgSecId,
        group_title: null,
        label: 'Citizenship Number',
        field_name: 'citizenship_number',
        field_type: 'text',
        placeholder: 'Enter Citizenship / National ID Number',
        default_value: '123456123456',
        is_required: 1,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 8,
        conditional_rules: JSON.stringify({ dependsOn: 'has_citizenship', value: 'Yes' })
      },
      {
        form_id: formId,
        section_id: bgSecId,
        group_title: null,
        label: 'National-Id/Citizenship/Passport Front Photo',
        field_name: 'id_front_photo',
        field_type: 'file',
        placeholder: 'Browse File',
        default_value: 'preview_front.png',
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 9,
        options: JSON.stringify({ file_types: ['image/*'], max_size_mb: 5 })
      },
      {
        form_id: formId,
        section_id: bgSecId,
        group_title: null,
        label: 'National-Id/Citizenship/Passport Back Photo',
        field_name: 'id_back_photo',
        field_type: 'file',
        placeholder: 'Browse File',
        default_value: 'preview_back.png',
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 10,
        options: JSON.stringify({ file_types: ['image/*'], max_size_mb: 5 })
      },
      // Group: REFERENCE DETAILS
      {
        form_id: formId,
        section_id: bgSecId,
        group_title: 'REFERENCE DETAILS',
        label: 'References',
        field_name: 'reference_details_table',
        field_type: 'table',
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 11,
        table_columns: JSON.stringify([
          { key: 'sn', label: 'SN', type: 'index', width: '50px' },
          { key: 'name', label: 'NAME *', type: 'text', required: true },
          { key: 'contact_number', label: 'CONTACT NUMBER *', type: 'tel', required: true },
          { key: 'country', label: 'COUNTRY *', type: 'select', required: true },
          { key: 'state_city', label: 'STATE/CITY *', type: 'text', required: true },
          { key: 'email', label: 'EMAIL *', type: 'email', required: true }
        ]),
        default_value: JSON.stringify([
          {
            sn: 1,
            name: 'Ajay',
            contact_number: '8962640908',
            country: 'British Indian Ocean Territory',
            state_city: 'MP',
            email: 'ajay@gmail.com'
          },
          {
            sn: 2,
            name: 'Vimal',
            contact_number: '9827658805',
            country: '(NRI Student) India',
            state_city: 'UP',
            email: 'vimal@gmail.com'
          }
        ])
      },

      // --- TAB 4: Student Choice Fill ---
      {
        form_id: formId,
        section_id: choiceSecId,
        group_title: null,
        label: 'Applied Status Banner',
        field_name: 'choice_applied_banner',
        field_type: 'alert',
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 1,
        options: JSON.stringify({
          alert_type: 'success',
          text: 'You have applied to 2 course(s).',
          action_button: 'View'
        })
      },
      {
        form_id: formId,
        section_id: choiceSecId,
        group_title: null,
        label: 'Choice Filling Lock Status Card',
        field_name: 'choice_locked_card',
        field_type: 'card_alert',
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 2,
        options: JSON.stringify({
          icon: 'fa-lock',
          title: 'Choice Filling Locked',
          description: 'You have submitted your choices. The panel is now locked and you cannot select more courses.',
          sub_text: 'Total Applied: 2 course(s)'
        })
      }
    ];

    // Clean up fields for this default form and insert fresh seed
    await knex('form_fields').where({ form_id: formId }).delete();
    for (const f of fieldsToInsert) {
      await knex('form_fields').insert({
        ...f,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    console.log(`Seeded ${fieldsToInsert.length} fields across 4 tabs successfully!`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await knex.destroy();
  }
}

seedFields();
