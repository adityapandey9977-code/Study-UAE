const db = require("../libraries/db");

// Default 6 tabs template definition
const DEFAULT_SECTIONS = [
  {
    section_name: 'Basic Information',
    section_key: 'basic_info',
    icon: 'fa-address-card',
    description: 'Personal details and contact information',
    step_order: 1,
    is_active: 1
  },
  {
    section_name: 'Educational Info/Documents',
    section_key: 'edu_info',
    icon: 'fa-university',
    description: 'Academic qualifications and marksheets',
    step_order: 2,
    is_active: 1
  },
  {
    section_name: 'Background Information',
    section_key: 'bg_info',
    icon: 'fa-newspaper',
    description: 'Passport, citizenship and reference contacts',
    step_order: 3,
    is_active: 1
  },
  {
    section_name: 'Guardian Details',
    section_key: 'guardian_info',
    icon: 'fa-user-shield',
    description: "Guardian's contact, occupation, and family income",
    step_order: 4,
    is_active: 1
  },
  {
    section_name: 'Student Choice Fill',
    section_key: 'choice_fill',
    icon: 'fa-hand-pointer',
    description: 'Course search, preferences and lock status',
    step_order: 5,
    is_active: 1
  },
  {
    section_name: 'Declaration & Others',
    section_key: 'declaration_info',
    icon: 'fa-file-signature',
    description: 'Candidate declaration, date & place certification',
    step_order: 6,
    is_active: 1
  }
];

function getDefaultFieldsForSection(sectionKey) {
  if (sectionKey === 'basic_info') {
    return [
      {
        group_title: null,
        label: 'First Name',
        field_name: 'first_name',
        field_type: 'text',
        placeholder: 'Enter First Name',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 1,
        validation_rules: JSON.stringify({ min: 2, max: 50 }),
        options: null
      },
      {
        group_title: null,
        label: 'Last Name',
        field_name: 'last_name',
        field_type: 'text',
        placeholder: 'Enter Last Name',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 2,
        validation_rules: JSON.stringify({ min: 2, max: 50 }),
        options: null
      },
      {
        group_title: null,
        label: 'Email',
        field_name: 'email',
        field_type: 'email',
        placeholder: 'Enter Email Address',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 3,
        validation_rules: JSON.stringify({ email: true }),
        options: JSON.stringify({ verified_badge: true })
      },
      {
        group_title: null,
        label: 'Gender',
        field_name: 'gender',
        field_type: 'select',
        placeholder: 'Select Gender',
        default_value: null,
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
        group_title: null,
        label: 'Date of Birth',
        field_name: 'dob',
        field_type: 'date',
        placeholder: 'Select Date of Birth',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 5,
        options: null
      },
      {
        group_title: null,
        label: 'Country',
        field_name: 'country',
        field_type: 'select',
        placeholder: 'Select Country',
        default_value: null,
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
        group_title: null,
        label: 'Father Name',
        field_name: 'father_name',
        field_type: 'text',
        placeholder: 'Enter Father Name',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 7,
        options: null
      },
      {
        group_title: null,
        label: 'Mother Name',
        field_name: 'mother_name',
        field_type: 'text',
        placeholder: 'Enter Mother Name',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 8,
        options: null
      },
      // Group: Course of Interest
      {
        group_title: 'Course of Interest',
        label: 'Academic Career',
        field_name: 'academic_career',
        field_type: 'select',
        placeholder: 'Select Academic Career',
        default_value: null,
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
        group_title: 'Course of Interest',
        label: 'Discipline',
        field_name: 'discipline',
        field_type: 'select',
        placeholder: 'Select Discipline',
        default_value: null,
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
        group_title: 'Contact Details',
        label: 'Country Code',
        field_name: 'country_code',
        field_type: 'select',
        placeholder: 'Select Country Code',
        default_value: null,
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
        group_title: 'Contact Details',
        label: 'Mobile No. (Whatsapp)',
        field_name: 'mobile_no',
        field_type: 'tel',
        placeholder: 'Enter Mobile / WhatsApp Number',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 12,
        options: null
      },
      // Group: Resident Details
      {
        group_title: 'Resident Details',
        label: 'Address',
        field_name: 'address',
        field_type: 'text',
        placeholder: 'Enter Residential Address',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 13,
        options: null
      },
      {
        group_title: 'Resident Details',
        label: 'Country',
        field_name: 'resident_country',
        field_type: 'select',
        placeholder: 'Select Country',
        default_value: null,
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
        group_title: 'Resident Details',
        label: 'State',
        field_name: 'state',
        field_type: 'select',
        placeholder: 'Select State',
        default_value: null,
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
        group_title: 'Resident Details',
        label: 'City',
        field_name: 'city',
        field_type: 'select',
        placeholder: 'Select City',
        default_value: null,
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
      }
    ];
  }

  if (sectionKey === 'edu_info') {
    return [
      {
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
        ])
      },
      {
        group_title: null,
        label: 'Document Upload Status Alert',
        field_name: 'edu_upload_alert',
        field_type: 'alert',
        default_value: null,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 2,
        options: JSON.stringify({
          alert_type: 'info',
          icon: 'fa-info-circle',
          text: 'Upload valid educational marksheets/certificates in JPG or PNG format.'
        })
      },
      {
        group_title: null,
        label: 'Verification Status Alert',
        field_name: 'edu_verification_alert',
        field_type: 'alert',
        default_value: null,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 3,
        options: JSON.stringify({
          alert_type: 'warning',
          icon: 'fa-exclamation-circle',
          text: 'Document verification will be conducted after application submission.'
        })
      }
    ];
  }

  if (sectionKey === 'bg_info') {
    return [
      {
        group_title: null,
        label: 'Do you have a valid passport?',
        field_name: 'has_valid_passport',
        field_type: 'radio',
        default_value: null,
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
        group_title: null,
        label: 'Name As Per Passport',
        field_name: 'passport_name',
        field_type: 'text',
        placeholder: 'Enter Name As Per Passport',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 2,
        conditional_rules: JSON.stringify({ dependsOn: 'has_valid_passport', value: 'Yes' })
      },
      {
        group_title: null,
        label: 'Passport Number',
        field_name: 'passport_number',
        field_type: 'text',
        placeholder: 'Enter Passport Number',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 3,
        conditional_rules: JSON.stringify({ dependsOn: 'has_valid_passport', value: 'Yes' })
      },
      {
        group_title: null,
        label: 'Issuing Authority',
        field_name: 'issuing_authority',
        field_type: 'text',
        placeholder: 'Enter Issuing Authority',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 4,
        conditional_rules: JSON.stringify({ dependsOn: 'has_valid_passport', value: 'Yes' })
      },
      {
        group_title: null,
        label: 'Passport Expiry Date',
        field_name: 'passport_expiry_date',
        field_type: 'date',
        placeholder: 'Select Passport Expiry Date',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 5,
        conditional_rules: JSON.stringify({ dependsOn: 'has_valid_passport', value: 'Yes' })
      },
      {
        group_title: null,
        label: 'Passport Issue Country',
        field_name: 'passport_issue_country',
        field_type: 'select',
        placeholder: 'Select Passport Issue Country',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-4',
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
        group_title: null,
        label: 'Have you applied for the passport?',
        field_name: 'has_passport_applied',
        field_type: 'radio',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 7,
        conditional_rules: JSON.stringify({ dependsOn: 'has_valid_passport', value: 'No' }),
        options: JSON.stringify([
          { label: 'Yes', value: 'Yes' },
          { label: 'No', value: 'No' }
        ])
      },
      {
        group_title: null,
        label: 'Passport File Reference Number',
        field_name: 'passport_file_ref_no',
        field_type: 'text',
        placeholder: 'Enter Passport File Reference Number',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 8,
        conditional_rules: JSON.stringify({ dependsOn: 'has_passport_applied', value: 'Yes' })
      },
      {
        group_title: null,
        label: 'Do you have a Citizenship number?',
        field_name: 'has_citizenship',
        field_type: 'radio',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 9,
        options: JSON.stringify([
          { label: 'Yes', value: 'Yes' },
          { label: 'No', value: 'No' }
        ])
      },
      {
        group_title: null,
        label: 'Citizenship Number',
        field_name: 'citizenship_number',
        field_type: 'text',
        placeholder: 'Enter Citizenship Number',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-4',
        mobile_size: 'col-12',
        field_order: 10,
        conditional_rules: JSON.stringify({ dependsOn: 'has_citizenship', value: 'Yes' })
      },
      {
        group_title: null,
        label: 'National-Id/Citizenship/Passport Front Photo',
        field_name: 'id_front_photo',
        field_type: 'file',
        placeholder: 'Browse File',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 11,
        options: JSON.stringify({ file_types: ['image/*'], max_size_mb: 5 })
      },
      {
        group_title: null,
        label: 'National-Id/Citizenship/Passport Back Photo',
        field_name: 'id_back_photo',
        field_type: 'file',
        placeholder: 'Browse File',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 12,
        options: JSON.stringify({ file_types: ['image/*'], max_size_mb: 5 })
      },
      // Group: REFERENCE DETAILS
      {
        group_title: 'REFERENCE DETAILS',
        label: 'References',
        field_name: 'reference_details_table',
        field_type: 'table',
        default_value: null,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 13,
        table_columns: JSON.stringify([
          { key: 'sn', label: 'SN', type: 'index', width: '50px' },
          { key: 'name', label: 'NAME *', type: 'text', required: true },
          { key: 'contact_number', label: 'CONTACT NUMBER *', type: 'tel', required: true },
          { key: 'country', label: 'COUNTRY *', type: 'select', required: true },
          { key: 'state_city', label: 'STATE/CITY *', type: 'text', required: true },
          { key: 'email', label: 'EMAIL *', type: 'email', required: true }
        ])
      }
    ];
  }

  if (sectionKey === 'guardian_info') {
    return [
      {
        group_title: null,
        label: "Guardian's Name",
        field_name: 'guardian_name',
        field_type: 'text',
        placeholder: "Enter Guardian's Full Name",
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 1,
        options: null
      },
      {
        group_title: null,
        label: "Guardian's Email Address",
        field_name: 'guardian_email',
        field_type: 'email',
        placeholder: "Enter Guardian's Email Address",
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 2,
        options: null
      },
      {
        group_title: null,
        label: "Guardian's Mobile Number",
        field_name: 'guardian_mobile',
        field_type: 'tel',
        placeholder: "Enter Guardian's Mobile Number",
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 3,
        options: null
      },
      {
        group_title: null,
        label: "Guardian's Occupation",
        field_name: 'guardian_occupation',
        field_type: 'select',
        placeholder: "Select Guardian's Occupation",
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 4,
        options: JSON.stringify([
          { label: 'Employed / Private Sector', value: 'Employed' },
          { label: 'Self-Employed / Business', value: 'Self-Employed / Business' },
          { label: 'Government Service', value: 'Government Service' },
          { label: 'Professional (Doctor/Lawyer/Engineer)', value: 'Professional' },
          { label: 'Retired', value: 'Retired' },
          { label: 'Other', value: 'Other' }
        ])
      },
      {
        group_title: null,
        label: "Guardian's Qualification",
        field_name: 'guardian_qualification',
        field_type: 'select',
        placeholder: "Select Guardian's Qualification",
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 5,
        options: JSON.stringify([
          { label: 'High School / Class 10th', value: 'High School' },
          { label: 'Intermediate / Class 12th', value: 'Intermediate' },
          { label: "Graduate / Bachelor's", value: 'Graduate' },
          { label: "Post Graduate / Master's", value: "Post Graduate / Master's" },
          { label: 'Doctorate / Ph.D.', value: 'Doctorate' },
          { label: 'Other', value: 'Other' }
        ])
      },
      {
        group_title: null,
        label: "Family's Annual Income",
        field_name: 'family_annual_income',
        field_type: 'select',
        placeholder: "Select Family's Annual Income",
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 6,
        options: JSON.stringify([
          { label: 'Less than USD 10,000', value: 'Less than USD 10,000' },
          { label: 'USD 10,000 - USD 25,000', value: 'USD 10,000 - USD 25,000' },
          { label: 'USD 25,000 - USD 50,000', value: 'USD 25,000 - USD 50,000' },
          { label: 'USD 50,000 - USD 100,000', value: 'USD 50,000 - USD 100,000' },
          { label: 'Above USD 100,000', value: 'Above USD 100,000' }
        ])
      }
    ];
  }

  if (sectionKey === 'choice_fill') {
    return [
      // Group: Course Filter & Search
      {
        group_title: 'Course Filter & Search',
        label: 'Institute Type',
        field_name: 'inst_type',
        field_type: 'select',
        placeholder: 'All Institute Types',
        default_value: null,
        is_required: 0,
        desktop_size: 'col-md-3',
        mobile_size: 'col-12',
        field_order: 1,
        options: JSON.stringify([
          { label: 'Public', value: 'Public' },
          { label: 'Private', value: 'Private' }
        ])
      },
      {
        group_title: 'Course Filter & Search',
        label: 'Academic Career',
        field_name: 'ac_id',
        field_type: 'select',
        placeholder: 'Select Academic Career',
        default_value: null,
        is_required: 0,
        desktop_size: 'col-md-3',
        mobile_size: 'col-12',
        field_order: 2,
        options: JSON.stringify([
          { label: 'Undergraduate', value: 'Undergraduate' },
          { label: 'Postgraduate', value: 'Postgraduate' },
          { label: 'Doctorate', value: 'Doctorate' }
        ])
      },
      {
        group_title: 'Course Filter & Search',
        label: 'Mode of Course',
        field_name: 'mode_of_course',
        field_type: 'select',
        placeholder: 'All Modes',
        default_value: null,
        is_required: 0,
        desktop_size: 'col-md-3',
        mobile_size: 'col-12',
        field_order: 3,
        options: JSON.stringify([
          { label: 'Online', value: 'online' },
          { label: 'Offline', value: 'offline' }
        ])
      },
      {
        group_title: 'Course Filter & Search',
        label: 'Institute Name / Course Search',
        field_name: 'course_search',
        field_type: 'text',
        placeholder: 'Enter institute or course keyword...',
        default_value: null,
        is_required: 0,
        desktop_size: 'col-md-3',
        mobile_size: 'col-12',
        field_order: 4,
        options: null
      },
      // Group: Student Course Preferences
      {
        group_title: 'Student Course Preferences',
        label: 'Selected Course Preferences',
        field_name: 'selected_choices_table',
        field_type: 'table',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 5,
        table_columns: JSON.stringify([
          { key: 'sn', label: 'PREFERENCE #', type: 'index', width: '80px' },
          { key: 'institute_name', label: 'INSTITUTE NAME', type: 'text', required: true },
          { key: 'course_name', label: 'COURSE NAME', type: 'text', required: true },
          { key: 'specialization', label: 'SPECIALIZATION', type: 'text', required: false },
          { key: 'mode_of_course', label: 'MODE', type: 'select', options: ['online', 'offline'], required: true }
        ])
      },
      // Group: Submission & Lock Status
      {
        group_title: 'Choice Filling Guidelines & Status',
        label: 'Choice Filling Guidelines Banner',
        field_name: 'choice_guidelines_banner',
        field_type: 'alert',
        default_value: null,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 6,
        options: JSON.stringify({
          alert_type: 'info',
          icon: 'fa-info-circle',
          text: 'You can apply for up to 3 preferred courses. Choices will be submitted and locked with your application.'
        })
      },
      {
        group_title: 'Choice Filling Guidelines & Status',
        label: 'Choice Filling Lock Status',
        field_name: 'choice_lock_status',
        field_type: 'select',
        placeholder: 'Select Choice Filling Lock Status',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 7,
        options: JSON.stringify([
          { label: 'In Progress / Draft', value: 'Draft' },
          { label: 'Submitted & Locked', value: 'Locked' }
        ])
      }
    ];
  }

  if (sectionKey === 'declaration_info') {
    return [
      {
        group_title: null,
        label: 'Declaration Statement',
        field_name: 'declaration_statement',
        field_type: 'alert',
        default_value: null,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 1,
        options: JSON.stringify({
          alert_type: 'info',
          icon: 'fa-certificate',
          title: 'DECLARATION & CERTIFICATION',
          text: 'I certify that the information submitted by me in support of this application, is true to best of my knowledge and belief. I understand that in the event of any information being found false or incorrect, my admission is liable to be rejected / cancelled at any stage of the program. I undertake to abide by the disciplinary rules and regulations of the institue.'
        })
      },
      {
        group_title: null,
        label: 'Declaration Agreement',
        field_name: 'declaration_agree',
        field_type: 'checkbox',
        placeholder: null,
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-12',
        mobile_size: 'col-12',
        field_order: 2,
        options: JSON.stringify([
          { label: 'I certify that the information submitted by me in support of this application, is true to best of my knowledge and belief. I understand that in the event of any information being found false or incorrect, my admission is liable to be rejected / cancelled at any stage of the program. I undertake to abide by the disciplinary rules and regulations of the institue.', value: '1' }
        ])
      },
      {
        group_title: 'Date & Place',
        label: 'Date',
        field_name: 'declaration_date',
        field_type: 'date',
        placeholder: 'Select Date',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 3,
        options: null
      },
      {
        group_title: 'Date & Place',
        label: 'Place',
        field_name: 'declaration_place',
        field_type: 'text',
        placeholder: 'Enter Place / City',
        default_value: null,
        is_required: 1,
        desktop_size: 'col-md-6',
        mobile_size: 'col-12',
        field_order: 4,
        options: null
      }
    ];
  }

  return [];
}

class ApplicationEngineService {
  /**
   * Get list of all forms
   */
  static async listForms(req) {
    const forms = await db.knex("appengine_forms")
      .select("*")
      .orderBy("id", "asc");
    return forms;
  }

  /**
   * Get active/default form with sections (tabs) and fields
   */
  static async getActiveForm(req) {
    let form = await db.knex("appengine_forms")
      .where({ is_default: 1, status: "active" })
      .first();

    if (!form) {
      form = await db.knex("appengine_forms").first();
    }

    if (!form) {
      return null;
    }

    return await this.getFormById(form.id);
  }

  /**
   * Get form by ID with sections and fields
   */
  static async getFormById(formId) {
    const form = await db.knex("appengine_forms")
      .where({ id: formId })
      .first();

    if (!form) {
      throw new Error(`Form with ID ${formId} not found`);
    }

    // Get sections (tabs) for this specific form
    let sections = await db.knex("form_sections")
      .where({ form_id: formId })
      .orderBy("step_order", "asc")
      .orderBy("id", "asc");

    if (sections.length === 0 && Number(formId) === 1) {
      sections = await db.knex("form_sections")
        .whereNull("form_id")
        .orderBy("step_order", "asc")
        .orderBy("id", "asc");
    }

    // Get all fields for this form
    const fields = await db.knex("form_fields")
      .where({ form_id: formId })
      .orderBy("field_order", "asc")
      .orderBy("id", "asc");

    // Parse json fields
    const parsedFields = fields.map(f => {
      let opts = f.options;
      let valRules = f.validation_rules;
      let condRules = f.conditional_rules;
      let tblCols = f.table_columns;
      let fConfig = f.field_config;
      let defVal = f.default_value;

      if (typeof opts === 'string') {
        try { opts = JSON.parse(opts); } catch(e) {}
      }
      if (typeof valRules === 'string') {
        try { valRules = JSON.parse(valRules); } catch(e) {}
      }
      if (typeof condRules === 'string') {
        try { condRules = JSON.parse(condRules); } catch(e) {}
      }
      if (typeof tblCols === 'string') {
        try { tblCols = JSON.parse(tblCols); } catch(e) {}
      }
      if (typeof fConfig === 'string') {
        try { fConfig = JSON.parse(fConfig); } catch(e) {}
      }
      if (typeof defVal === 'string' && (defVal.startsWith('[') || defVal.startsWith('{'))) {
        try { defVal = JSON.parse(defVal); } catch(e) {}
      }

      return {
        ...f,
        options: opts,
        validation_rules: valRules,
        conditional_rules: condRules,
        table_columns: tblCols,
        field_config: fConfig,
        default_value: defVal
      };
    });

    // Group fields by section_id
    const sectionsWithFields = sections.map(sec => {
      let secConfig = sec.config;
      if (typeof secConfig === 'string') {
        try { secConfig = JSON.parse(secConfig); } catch(e) {}
      }

      const secFields = parsedFields.filter(f => Number(f.section_id) === Number(sec.id));
      return {
        ...sec,
        config: secConfig,
        fields: secFields
      };
    });

    return {
      ...form,
      sections: sectionsWithFields,
      all_fields: parsedFields
    };
  }

  /**
   * Save or create Form info and handle template seeding
   */
  static async saveForm(data, req) {
    const payload = {
      form_name: data.form_name,
      form_title: data.form_title || data.form_name,
      form_description: data.form_description || null,
      form_slug: data.form_slug || null,
      status: data.status || 'active',
      is_default: data.is_default ? 1 : 0,
      settings: data.settings ? (typeof data.settings === 'string' ? data.settings : JSON.stringify(data.settings)) : null,
      updated_at: new Date()
    };

    if (data.id) {
      await db.knex("appengine_forms").where({ id: data.id }).update(payload);
      return await this.getFormById(data.id);
    } else {
      payload.created_at = new Date();
      payload.created_by = req?.currentUser?.id || 1;
      const [newFormId] = await db.knex("appengine_forms").insert(payload);

      // Handle template initialization for newly created form
      const templateSource = data.template_source || 'default';

      if (templateSource === 'default') {
        // Create 6 default tabs and fields in form_sections & form_fields
        for (const secDef of DEFAULT_SECTIONS) {
          const [secId] = await db.knex("form_sections").insert({
            form_id: newFormId,
            section_name: secDef.section_name,
            section_key: secDef.section_key,
            icon: secDef.icon,
            description: secDef.description,
            step_order: secDef.step_order,
            is_active: secDef.is_active,
            created_at: new Date(),
            updated_at: new Date()
          });

          const secFields = getDefaultFieldsForSection(secDef.section_key);
          for (const f of secFields) {
            await db.knex("form_fields").insert({
              ...f,
              form_id: newFormId,
              section_id: secId,
              field_class: 'form-control',
              field_id: f.field_name,
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        }
      } else if (templateSource === 'clone' && data.clone_form_id) {
        // Clone from existing form
        const sourceSections = await db.knex("form_sections").where({ form_id: data.clone_form_id }).orderBy("step_order", "asc");
        for (const srcSec of sourceSections) {
          const [newSecId] = await db.knex("form_sections").insert({
            form_id: newFormId,
            section_name: srcSec.section_name,
            section_key: srcSec.section_key,
            icon: srcSec.icon,
            description: srcSec.description,
            step_order: srcSec.step_order,
            is_active: srcSec.is_active,
            config: typeof srcSec.config === 'object' ? JSON.stringify(srcSec.config) : srcSec.config,
            created_at: new Date(),
            updated_at: new Date()
          });

          const srcFields = await db.knex("form_fields").where({ section_id: srcSec.id });
          for (const srcF of srcFields) {
            const { id, created_at, updated_at, ...fData } = srcF;
            await db.knex("form_fields").insert({
              ...fData,
              form_id: newFormId,
              section_id: newSecId,
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        }
      } else if (templateSource === 'blank') {
        // Create 1 blank initial tab
        await db.knex("form_sections").insert({
          form_id: newFormId,
          section_name: 'Basic Information',
          section_key: 'basic_info',
          icon: 'fa-address-card',
          step_order: 1,
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      return await this.getFormById(newFormId);
    }
  }

  /**
   * Save or update Tab (Section)
   */
  static async saveSection(data, req) {
    const payload = {
      form_id: data.form_id || 1,
      section_name: data.section_name,
      section_key: data.section_key || data.section_name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      icon: data.icon || 'fa-file-alt',
      description: data.description || null,
      step_order: data.step_order || 1,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      config: data.config ? (typeof data.config === 'string' ? data.config : JSON.stringify(data.config)) : null,
      updated_at: new Date()
    };

    if (data.id && !String(data.id).startsWith('new_')) {
      await db.knex("form_sections").where({ id: data.id }).update(payload);
      return await db.knex("form_sections").where({ id: data.id }).first();
    } else {
      payload.created_at = new Date();
      const [id] = await db.knex("form_sections").insert(payload);
      return await db.knex("form_sections").where({ id }).first();
    }
  }

  /**
   * Delete Tab (Section)
   */
  static async deleteSection(sectionId) {
    await db.knex("form_fields").where({ section_id: sectionId }).delete();
    await db.knex("form_sections").where({ id: sectionId }).delete();
    return { success: true, message: "Section deleted successfully" };
  }

  /**
   * Delete Form, its sections and all its fields
   */
  static async deleteForm(formId) {
    const totalForms = await db.knex("appengine_forms").count("* as count").first();
    if (totalForms.count <= 1) {
      throw new Error("Cannot delete the only remaining application form.");
    }

    const form = await db.knex("appengine_forms").where({ id: formId }).first();
    if (!form) {
      throw new Error(`Form with ID ${formId} not found`);
    }

    // Delete all fields belonging to this form
    await db.knex("form_fields").where({ form_id: formId }).delete();
    // Delete all sections belonging to this form
    await db.knex("form_sections").where({ form_id: formId }).delete();
    // Delete form record
    await db.knex("appengine_forms").where({ id: formId }).delete();

    // If deleted form was default, make the first remaining form default
    if (form.is_default) {
      const nextForm = await db.knex("appengine_forms").first();
      if (nextForm) {
        await db.knex("appengine_forms").where({ id: nextForm.id }).update({ is_default: 1, status: "active" });
      }
    }

    return { success: true, message: `Form "${form.form_name}" deleted successfully` };
  }

  /**
   * Save or update a form field directly in form_fields table
   */
  static async saveField(data, req) {
    const payload = {
      form_id: data.form_id || 1,
      section_id: data.section_id,
      group_title: data.group_title || null,
      label: data.label,
      field_name: data.field_name,
      field_type: data.field_type || 'text',
      placeholder: data.placeholder || null,
      default_value: typeof data.default_value === 'object' && data.default_value !== null ? JSON.stringify(data.default_value) : (data.default_value !== undefined ? String(data.default_value) : null),
      is_required: data.is_required ? 1 : 0,
      field_class: data.field_class || 'form-control',
      field_id: data.field_id || data.field_name,
      desktop_size: data.desktop_size || 'col-md-6',
      mobile_size: data.mobile_size || 'col-12',
      help_text: data.help_text || null,
      validation_rules: data.validation_rules ? (typeof data.validation_rules === 'string' ? data.validation_rules : JSON.stringify(data.validation_rules)) : null,
      options: data.options ? (typeof data.options === 'string' ? data.options : JSON.stringify(data.options)) : null,
      conditional_rules: data.conditional_rules ? (typeof data.conditional_rules === 'string' ? data.conditional_rules : JSON.stringify(data.conditional_rules)) : null,
      table_columns: data.table_columns ? (typeof data.table_columns === 'string' ? data.table_columns : JSON.stringify(data.table_columns)) : null,
      field_config: data.field_config ? (typeof data.field_config === 'string' ? data.field_config : JSON.stringify(data.field_config)) : null,
      field_order: data.field_order || 0,
      updated_at: new Date()
    };

    if (data.id && !String(data.id).startsWith('new_')) {
      await db.knex("form_fields").where({ id: data.id }).update(payload);
      return await db.knex("form_fields").where({ id: data.id }).first();
    } else {
      payload.created_at = new Date();
      const [id] = await db.knex("form_fields").insert(payload);
      return await db.knex("form_fields").where({ id }).first();
    }
  }

  /**
   * Delete Field
   */
  static async deleteField(fieldId) {
    await db.knex("form_fields").where({ id: fieldId }).delete();
    return { success: true, message: "Field deleted successfully" };
  }

  /**
   * Save entire form schema (sections and fields) in one call
   */
  static async saveFullSchema(formId, schema, req) {
    return await db.knex.transaction(async (trx) => {
      // 1. Update form metadata if provided
      if (schema.form_name) {
        await trx("appengine_forms").where({ id: formId }).update({
          form_name: schema.form_name,
          form_title: schema.form_title || schema.form_name,
          form_description: schema.form_description || null,
          status: schema.status || 'active',
          updated_at: new Date()
        });
      }

      // 2. Iterate sections
      if (Array.isArray(schema.sections)) {
        for (let i = 0; i < schema.sections.length; i++) {
          const sec = schema.sections[i];
          const secPayload = {
            form_id: formId,
            section_name: sec.section_name,
            section_key: sec.section_key || sec.section_name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            icon: sec.icon || 'fa-file-alt',
            description: sec.description || null,
            step_order: i + 1,
            is_active: sec.is_active !== undefined ? (sec.is_active ? 1 : 0) : 1,
            config: sec.config ? (typeof sec.config === 'string' ? sec.config : JSON.stringify(sec.config)) : null,
            updated_at: new Date()
          };

          let currentSecId = sec.id;
          if (currentSecId && !String(currentSecId).startsWith('new_')) {
            await trx("form_sections").where({ id: currentSecId }).update(secPayload);
          } else {
            secPayload.created_at = new Date();
            const [newId] = await trx("form_sections").insert(secPayload);
            currentSecId = newId;
          }

          // 3. Save fields for this section
          if (Array.isArray(sec.fields)) {
            for (let j = 0; j < sec.fields.length; j++) {
              const f = sec.fields[j];
              const fPayload = {
                form_id: formId,
                section_id: currentSecId,
                group_title: f.group_title || null,
                label: f.label,
                field_name: f.field_name,
                field_type: f.field_type || 'text',
                placeholder: f.placeholder || null,
                default_value: typeof f.default_value === 'object' && f.default_value !== null ? JSON.stringify(f.default_value) : (f.default_value !== undefined ? String(f.default_value) : null),
                is_required: f.is_required ? 1 : 0,
                field_class: f.field_class || 'form-control',
                field_id: f.field_id || f.field_name,
                desktop_size: f.desktop_size || 'col-md-6',
                mobile_size: f.mobile_size || 'col-12',
                help_text: f.help_text || null,
                validation_rules: f.validation_rules ? (typeof f.validation_rules === 'string' ? f.validation_rules : JSON.stringify(f.validation_rules)) : null,
                options: f.options ? (typeof f.options === 'string' ? f.options : JSON.stringify(f.options)) : null,
                conditional_rules: f.conditional_rules ? (typeof f.conditional_rules === 'string' ? f.conditional_rules : JSON.stringify(f.conditional_rules)) : null,
                table_columns: f.table_columns ? (typeof f.table_columns === 'string' ? f.table_columns : JSON.stringify(f.table_columns)) : null,
                field_config: f.field_config ? (typeof f.field_config === 'string' ? f.field_config : JSON.stringify(f.field_config)) : null,
                field_order: j + 1,
                updated_at: new Date()
              };

              if (f.id && !String(f.id).startsWith('new_')) {
                await trx("form_fields").where({ id: f.id }).update(fPayload);
              } else {
                fPayload.created_at = new Date();
                await trx("form_fields").insert(fPayload);
              }
            }
          }
        }
      }

      return await ApplicationEngineService.getFormById(formId);
    });
  }
}

module.exports = ApplicationEngineService;
