import { comment } from "postcss";

// Constants
export const REQUEST_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const REQUEST_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  APPROVER: 'approver',
  USER: 'user'
};

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SKIPPED: 'skipped'
};

// --- Access Log constants ---
export const ACCESS_ACTION = {
  ADMIT: 'admit',
  DENY: 'deny',
};

export const ACCESS_METHOD = {
  SCAN: 'scan',
  MANUAL: 'manual',
};

  
export const demoAccessLogs = [
  {
    id: 1,
    ts: '2025-08-07T15:05:00Z',
    requestId: 2,
    requestNumber: 'REQ-00002',
    requesterName: 'Emmanuel Kamanda',
    facility: 'server_room',
    gate: 'Server Room North Gate',
    action: ACCESS_ACTION.ADMIT,
    method: ACCESS_METHOD.SCAN,
    guardName: 'Guard Alpha',
    reason: 'Valid pass',
    valid: true,
  },
  {
    id: 2,
    ts: '2025-08-07T15:40:00Z',
    requestId: 4,
    requestNumber: 'REQ-00004',
    requesterName: 'Sarah Davis',
    facility: 'data_center',
    gate: 'DC Lobby Turnstile',
    action: ACCESS_ACTION.DENY,
    method: ACCESS_METHOD.SCAN,
    guardName: 'Guard Bravo',
    reason: 'Pass not approved',
    valid: false,
  },
  {
    id: 3,
    ts: '2025-08-10T09:10:00Z',
    requestId: 6,
    requestNumber: 'REQ-00006',
    requesterName: 'Lisa Brown',
    facility: 'fiber_splice_room',
    gate: 'Splice Room South',
    action: ACCESS_ACTION.ADMIT,
    method: ACCESS_METHOD.MANUAL,
    guardName: 'Guard Alpha',
    reason: 'Known technician – manual override',
    valid: true,
  },
];

// --- Tiny helpers to read/write logs via localStorage (keeps demo state across navigations) ---
const LS_KEY = 'demoAccessLogs';

export function getAccessLogs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return demoAccessLogs;
}

export function setAccessLogs(next) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {}
}

export function recordAccessLog(entry) {
  const base = getAccessLogs();
  const nextId = (base.at(-1)?.id || 0) + 1;
  const row = {
    id: nextId,
    ts: new Date().toISOString(),
    ...entry,
  };
  const next = [...base, row];
  setAccessLogs(next);
  return row;
}
  


// Enhanced Demo Form Templates for Telecom IT Access
export const demoFormTemplates = [
    {
      id: 1,
      templateName: 'IT Access Request',
      description: 'Request for IT infrastructure and system access',
      category: 'IT Security',
      isDefault: true,
      isActive: true,
      formSchema: {
        fields: [
          {
            name: 'accessType',
            type: 'select',
            label: 'Access Type',
            required: true,
            options: [
              { value: 'new', label: 'New Access Request' },
              { value: 'modify', label: 'Modify Existing Access' },
              { value: 'temporary', label: 'Temporary Access' },
              { value: 'remove', label: 'Remove Access' }
            ]
          },
          {
            name: 'facilityAccess',
            type: 'select',
            label: 'Facility/Room Access',
            required: true,
            options: [
              { value: 'switch_room', label: 'Switch Room' },
              { value: 'server_room', label: 'Server Room' },
              { value: 'data_center', label: 'Data Center' },
              { value: 'network_operations_center', label: 'Network Operations Center (NOC)' },
              { value: 'transmission_room', label: 'Transmission Room' },
              { value: 'telecom_equipment_room', label: 'Telecom Equipment Room' },
              { value: 'backup_power_room', label: 'Backup Power Room (UPS/Generator)' },
              { value: 'mdf_room', label: 'Main Distribution Frame (MDF) Room' },
              { value: 'idf_room', label: 'Intermediate Distribution Frame (IDF) Room' },
              { value: 'fiber_splice_room', label: 'Fiber Splice Room' }
            ]
          },
          {
            name: 'systemAccess',
            type: 'multiselect',
            label: 'System Access Required',
            required: false,
            options: [
              { value: 'network_management', label: 'Network Management System (NMS)' },
              { value: 'billing_system', label: 'Billing System' },
              { value: 'customer_management', label: 'Customer Management System (CRM)' },
              { value: 'inventory_management', label: 'Inventory Management System' },
              { value: 'workforce_management', label: 'Workforce Management System' },
              { value: 'trouble_ticketing', label: 'Trouble Ticketing System' },
              { value: 'provisioning_system', label: 'Service Provisioning System' },
              { value: 'monitoring_tools', label: 'Network Monitoring Tools' },
              { value: 'configuration_management', label: 'Configuration Management' },
              { value: 'security_systems', label: 'Security Management Systems' }
            ]
          },
          {
            name: 'accessLevel',
            type: 'select',
            label: 'Access Level Required',
            required: true,
            options: [
              { value: 'read_only', label: 'Read Only' },
              { value: 'read_write', label: 'Read/Write' },
              { value: 'administrator', label: 'Administrator' },
              { value: 'super_admin', label: 'Super Administrator' },
              { value: 'maintenance', label: 'Maintenance Access' },
              { value: 'emergency', label: 'Emergency Access' }
            ]
          },
          {
            name: 'businessJustification',
            type: 'textarea',
            label: 'Business Justification',
            required: true,
            maxLength: 1000,
            placeholder: 'Explain why this access is needed for your role and responsibilities...'
          },
          {
            name: 'duration',
            type: 'select',
            label: 'Access Duration',
            required: true,
            options: [
              { value: 'permanent', label: 'Permanent' },
              { value: 'temporary', label: 'Temporary' },
              { value: 'project_based', label: 'Project Based' },
              { value: 'emergency', label: 'Emergency (24 hours)' }
            ]
          },
          {
            "id": "field_1755106240713",
            "name": "columns_1755106245370",
            "type": "columns",
            "label": "New Columns",
            "required": false,
            "placeholder": "",
            "children": [
              {
                "id": "field_1755106245448",
                "name": "startDate",
                "type": "date",
                "label": "Access Start Date",
                "required": true,
                "placeholder": "",
                "min": "",
                "max": "",
                "columnSpan": 1
              },
              {
                "id": "field_1755106245449",
                "name": "endDate",
                "type": "date",
                "label": "Access End Date",
                "required": false,
                "placeholder": "",
                "min": "",
                "max": "",
                "columnSpan": 1
              }
            ],
            "layout": {
              "columns": 2,
              "gap": "md"
            }
          },
          {
            name: 'workShift',
            type: 'select',
            label: 'Work Shift',
            required: true,
            options: [
              { value: 'day_shift', label: 'Day Shift (8 AM - 6 PM)' },
              { value: 'night_shift', label: 'Night Shift (6 PM - 8 AM)' },
              { value: 'rotating_shift', label: 'Rotating Shift' },
              { value: 'on_call', label: 'On-Call Basis' },
              { value: 'maintenance_window', label: 'Maintenance Window Only' }
            ]
          },
          {
            name: 'supervisorApproval',
            type: 'text',
            label: 'Direct Supervisor Name',
            required: true,
            placeholder: 'Name of your direct supervisor'
          },
          {
            "id": "field_1755080998306",
            "name": "signature_1755081002980",
            "type": "signature",
            "label": "Signature",
            "required": true,
            "placeholder": "",
            "maxWidth": 400,
            "maxHeight": 200,
            "signatureMode": "draw",
            "columnSpan": 1
          },
          {
            name: 'complianceAcknowledgment',
            type: 'checkbox',
            label: 'I acknowledge that I have read and understand the IT Security Policy and will comply with all access requirements',
            required: true
          },

        ]
      },
      approvers: {
        approvers: [
          {
            id: 1,
            userId: 2,
            userName: 'Jane Smith',
            userEmail: 'jane.smith@africell.sl',
            userRole: 'manager',
            userDepartment: 'IT Security',
            userJobTitle: 'IT Security Manager',
            isRequired: true,
            canDelegate: true,
            order: 1
          },
          {
            id: 2,
            userId: 4,
            userName: 'Moses',
            userEmail: 'cto@africell.sl',
            userRole: 'manager',
            userDepartment: 'Network Operations',
            userJobTitle: 'Network Operations Manager',
            isRequired: false,
            canDelegate: true,
            order: 2
          }
        ],
        mode: 'sequential'
      },
      createdBy: 3,
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-01T10:00:00Z'
    },{
    "id": 2,
    "templateName": "IT System Access Request",
    "description": "Request access to IT systems and applications",
    "category": "IT Security",
    "formSchema": {
        "fields": [
            {
                "type": "text",
                "name": "requestTitle",
                "label": "Request Title",
                "required": true,
                "placeholder": "Brief description of access needed"
            },
            {
                "type": "select",
                "name": "accessType",
                "label": "Access Type",
                "required": true,
                "options": [
                    {
                        "value": "new",
                        "label": "New Access"
                    },
                    {
                        "value": "modify",
                        "label": "Modify Existing Access"
                    },
                    {
                        "value": "temporary",
                        "label": "Temporary Access"
                    }
                ]
            },
            {
                "type": "multiselect",
                "name": "systemAccess",
                "label": "Systems Requiring Access",
                "required": true,
                "options": [
                    {
                        "value": "network_management",
                        "label": "Network Management System"
                    },
                    {
                        "value": "billing_system",
                        "label": "Billing System"
                    },
                    {
                        "value": "customer_management",
                        "label": "Customer Management"
                    },
                    {
                        "value": "inventory_management",
                        "label": "Inventory Management"
                    },
                    {
                        "value": "monitoring_tools",
                        "label": "Network Monitoring Tools"
                    }
                ]
            },
            {
                "type": "select",
                "name": "accessLevel",
                "label": "Access Level Required",
                "required": true,
                "options": [
                    {
                        "value": "read_only",
                        "label": "Read Only"
                    },
                    {
                        "value": "read_write",
                        "label": "Read/Write"
                    },
                    {
                        "value": "administrator",
                        "label": "Administrator"
                    }
                ]
            },
            {
                "type": "textarea",
                "name": "businessJustification",
                "label": "Business Justification",
                "required": true,
                "maxLength": 1000,
                "placeholder": "Explain why this access is needed and how it relates to your job responsibilities"
            },
            {
                "type": "select",
                "name": "duration",
                "label": "Access Duration",
                "required": true,
                "options": [
                    {
                        "value": "permanent",
                        "label": "Permanent"
                    },
                    {
                        "value": "30_days",
                        "label": "30 Days"
                    },
                    {
                        "value": "60_days",
                        "label": "60 Days"
                    },
                    {
                        "value": "90_days",
                        "label": "90 Days"
                    }
                ]
            },
            {
                "type": "date",
                "name": "startDate",
                "label": "Required Start Date",
                "required": true
            },
            {
                "type": "text",
                "name": "supervisorApproval",
                "label": "Supervisor Approval",
                "required": true,
                "placeholder": "Name and title of approving supervisor"
            },
            {
                "type": "checkbox",
                "name": "complianceAcknowledgment",
                "label": "I acknowledge that I will comply with all IT security policies and procedures",
                "required": true
            }
        ]
    },
    "isActive": true,
    "isDefault": false,
    "version": 1,
    "createdBy": 3,
    "createdAt": "2025-08-14T17:28:02.509Z",
    "updatedAt": "2025-08-14T17:28:02.509Z",
    "creator": {
        "id": 3,
        "username": "ekamanda",
        "email": "ekamanda@africell.sl"
    },
    "approvalConfig": {
        "id": 1,
        "templateId": 1,
        "approverMode": "sequential",
        "approvers": "[{\"userId\":2,\"name\":\"John Doe\",\"role\":\"IT Manager\",\"order\":1},{\"userId\":1,\"name\":\"Admin\",\"role\":\"System Administrator\",\"order\":2}]",
        "createdAt": "2025-08-14T17:28:02.550Z",
        "updatedAt": "2025-08-14T17:28:02.550Z"
    },
    "fieldCount": 9,
    "requiredFieldCount": 9,
    "approvers": [
        {
            "userId": 2,
            "name": "John Doe",
            "role": "IT Manager",
            "order": 1
        },
        {
            "userId": 1,
            "name": "Admin",
            "role": "System Administrator",
            "order": 2
        }
    ],
    "approverMode": "sequential"
}

    
];

// Enhanced Demo Requests for Telecom IT Access
export const demoRequests = [
  {
    id: 1,
    requestNumber: 'REQ-00001',
    title: 'Switch Room Access - Network Maintenance',
    templateId: 1,
    requesterId: 1,
    requesterName: 'John Doe',
    requesterEmail: 'john.doe@africell.sl',
    status: 'pending',
    priority: 'high',
    currentApprovalLevel: 1,
    totalApprovalLevels: 2,
    assignedTo: 2,
    assignedToName: 'Jane Smith',
    formData: {
      accessType: 'new',
      facilityAccess: 'switch_room',
      systemAccess: ['network_management', 'monitoring_tools'],
      accessLevel: 'administrator',
      businessJustification: 'Need access to switch room for routine network maintenance and troubleshooting of core switching equipment. As the new Network Engineer, I require administrator access to network management systems to monitor network performance and resolve connectivity issues.',
      duration: 'permanent',
      startDate: '2025-08-20',
      workShift: 'day_shift',
      supervisorApproval: 'Emmanuel Kamanda - Network Operations Manager',
      complianceAcknowledgment: true
    },
    createdAt: '2025-08-10T10:00:00Z',
    updatedAt: '2025-08-10T10:30:00Z',
    submittedAt: '2025-08-10T10:30:00Z',
    dueDate: '2025-08-15T17:00:00Z'
  },
  {
    id: 2,
    requestNumber: 'REQ-00002',
    title: 'Server Room Access - Database Maintenance',
    templateId: 1,
    requesterId: 4,
    requesterName: 'Emmanuel Kamanda',
    requesterEmail: 'ekamanda@africell.sl',
    status: 'approved',
    priority: 'normal',
    currentApprovalLevel: 2,
    totalApprovalLevels:  2,
    assignedTo: 2,
    assignedToName: 'System Administrator',
    formData: {
      accessType: 'modify',
      facilityAccess: 'server_room',
      systemAccess: ['billing_system', 'customer_management', 'inventory_management'],
      accessLevel: 'read_write',
      businessJustification: 'Need to modify existing server room access to include database maintenance responsibilities. Current role expansion requires access to billing and customer management systems for data integrity checks and system optimization.',
      duration: 'permanent',
      startDate: '2025-08-05',
      workShift: 'rotating_shift',
      supervisorApproval: 'Sarah Davis - IT Operations Manager',
      complianceAcknowledgment: true
    },
    createdAt: '2025-08-05T10:00:00Z',
    updatedAt: '2025-08-07T14:30:00Z',
    submittedAt: '2025-08-05T11:00:00Z',
    completedAt: '2025-08-07T14:30:00Z'
  },
  {
    id: 3,
    requestNumber: 'REQ-00003',
    title: 'NOC Emergency Access - Network Outage Response',
    templateId: 1,
    requesterId: 2,
    requesterName: 'Jane Smith',
    requesterEmail: 'jane.smith@africell.sl',
    status: 'draft',
    priority: 'urgent',
    currentApprovalLevel: 0,
    totalApprovalLevels: 0,
    formData: {
      accessType: 'temporary',
      facilityAccess: 'network_operations_center',
      systemAccess: ['network_management', 'trouble_ticketing', 'monitoring_tools', 'provisioning_system'],
      accessLevel: 'emergency',
      businessJustification: 'Temporary emergency access needed for Network Operations Center during critical network outage situations. As backup NOC engineer, need immediate access to all network management systems to restore service during primary engineer unavailability.',
      duration: 'emergency',
      startDate: '2025-08-12',
      endDate: '2025-08-13',
      workShift: 'on_call',
      supervisorApproval: 'David Wilson - NOC Manager',
      complianceAcknowledgment: true
    },
    createdAt: '2025-08-11T09:00:00Z',
    updatedAt: '2025-08-11T09:15:00Z'
  },
  {
    id: 4,
    requestNumber: 'REQ-00004',
    title: 'Data Center Access - Hardware Installation',
    templateId: 1,
    requesterId: 5,
    requesterName: 'Sarah Davis',
    requesterEmail: 'sarah.davis@africell.sl',
    status: 'pending',
    priority: 'high',
    currentApprovalLevel: 1,
    totalApprovalLevels: 2,
    assignedTo: 2,
    assignedToName: 'Jane Smith',
    formData: {
      accessType: 'temporary',
      facilityAccess: 'data_center',
      systemAccess: ['inventory_management', 'configuration_management'],
      accessLevel: 'maintenance',
      businessJustification: 'Temporary access required for data center hardware installation project. Need to install new fiber optic equipment and update inventory management system with new asset information. Project duration is 2 weeks.',
      duration: 'project_based',
      startDate: '2025-08-15',
      endDate: '2025-08-29',
      workShift: 'maintenance_window',
      supervisorApproval: 'Robert Chen - Infrastructure Manager',
      complianceAcknowledgment: true
    },
    createdAt: '2025-08-08T11:00:00Z',
    updatedAt: '2025-08-08T11:30:00Z',
    submittedAt: '2025-08-08T11:30:00Z',
    dueDate: '2025-08-12T17:00:00Z'
  },
  {
    id: 5,
    requestNumber: 'REQ-00005',
    title: 'Transmission Room Access - Fiber Splice Work',
    templateId: 1,
    requesterId: 6,
    requesterName: 'David Wilson',
    requesterEmail: 'david.wilson@africell.sl',
    status: 'rejected',
    priority: 'normal',
    currentApprovalLevel: 1,
    totalApprovalLevels: 2,
    assignedTo: 2,
    assignedToName: 'Jane Smith',
    formData: {
      accessType: 'new',
      facilityAccess: 'transmission_room',
      systemAccess: ['network_management'],
      accessLevel: 'read_only',
      businessJustification: 'Need access to transmission room for fiber optic cable splicing and maintenance work. Regular access required for ongoing network expansion project.',
      duration: 'permanent',
      startDate: '2025-08-01',
      workShift: 'day_shift',
      supervisorApproval: 'Lisa Brown - Field Operations Manager',
      complianceAcknowledgment: true
    },
    createdAt: '2025-07-28T14:00:00Z',
    updatedAt: '2025-08-01T09:00:00Z',
    submittedAt: '2025-07-28T15:00:00Z',
    completedAt: '2025-08-01T09:00:00Z',
    rejectionReason: 'Insufficient security clearance level for transmission room access. Please complete Advanced Security Training and resubmit with updated clearance documentation.'
  },
  {
    id: 6,
    requestNumber: 'REQ-00006',
    title: 'Switch Room Access',
    templateId: 1,
    requesterId: 7,
    requesterName: 'Lisa Brown',
    requesterEmail: 'lisa.brown@africell.sl',
    status: 'approved',
    priority: 'normal',
    currentApprovalLevel: 2,
    totalApprovalLevels: 2,
    formData: {
      accessType: 'new',
      facilityAccess: 'switch_room',
      systemAccess: ['inventory_management', 'workforce_management'],
      accessLevel: 'read_write',
      businessJustification: 'New role as Fiber Optic Technician requires access to fiber splice room for cable management and splicing operations. Need inventory access to track fiber assets and workforce management for job scheduling.',
      duration: 'temporary',
      startDate: '2025-08-10',
      endDate: '2025-08-20',
      workShift: 'day_shift',
      supervisorApproval: 'Tom Anderson - Technical Operations Director',
      complianceAcknowledgment: true
    },
    createdAt: '2025-08-02T13:00:00Z',
    updatedAt: '2025-08-05T16:00:00Z',
    submittedAt: '2025-08-02T14:00:00Z',
    completedAt: '2025-08-05T16:00:00Z'
  }
];

// Updated Demo Users for Telecom Company
export const demoUsers = [
  {
    id: 1,
    username: 'john.doe',
    email: 'john.doe@africell.sl',
    fullName: 'John Doe',
    role: 'user',
    department: 'Network Engineering',
    jobTitle: 'Senior Network Engineer',
    isActive: true,
    createdAt: '2025-01-15T10:00:00Z',
    lastLogin: '2025-08-11T08:30:00Z'
  },
  {
    id: 2,
    username: 'jane.smith',
    email: 'jane.smith@africell.sl',
    fullName: 'Jane Smith',
    role: 'manager',
    department: 'IT Security',
    jobTitle: 'IT Security Manager',
    isActive: true,
    createdAt: '2025-01-10T10:00:00Z',
    lastLogin: '2025-08-11T09:15:00Z'
  },

  {
    id: 3,
    username: 'admin',
    email: 'admin@africell.sl',
    fullName: 'System Administrator',
    role: 'admin',
    department: 'IT Operations',
    jobTitle: 'IT Administrator',
    isActive: true,
    createdAt: '2025-01-01T10:00:00Z',
    lastLogin: '2025-08-11T07:45:00Z'
  },
  {
    id: 4,
    username: 'mike.johnson',
    email: 'ekamanda@africell.sl',
    fullName: 'Emmanuel Kamanda',
    role: 'approver',
    department: 'Network Operations',
    jobTitle: 'Network Operations Manager',
    isActive: true,
    createdAt: '2025-02-01T10:00:00Z',
    lastLogin: '2025-08-10T16:20:00Z'
  },
  {
    id: 5,
    username: 'cto',
    email: 'cto@africell.sl',
    fullName: 'CTO',
    role: 'approver',
    department: 'Technical',
    jobTitle: 'CTO',
    isActive: true,
    createdAt: '2025-03-15T10:00:00Z',
    lastLogin: '2025-08-09T14:30:00Z'
  },
  {
    id: 6,
    username: 'david.wilson',
    email: 'david.wilson@africell.sl',
    fullName: 'David Wilson',
    role: 'user',
    department: 'Field Operations',
    jobTitle: 'Field Technician',
    isActive: true,
    createdAt: '2025-04-01T10:00:00Z',
    lastLogin: '2025-08-08T12:45:00Z'
  },
  {
    id: 7,
    username: 'lisa.brown',
    email: 'lisa.brown@africell.sl',
    fullName: 'Lisa Brown',
    role: 'user',
    department: 'Technical Operations',
    jobTitle: 'Fiber Optic Technician',
    isActive: true,
    createdAt: '2025-05-01T10:00:00Z',
    lastLogin: '2025-08-07T11:20:00Z'
  }
];

// Enhanced Demo Notifications for Telecom Context
export const demoNotifications = [
  {
    id: 1,
    userId: 3,
    type: 'approval_request',
    title: 'New IT Access Request',
    message: 'REQ-00001: Switch Room Access request requires your approval',
    data: { requestId: 1, requestNumber: 'REQ-00001' },
    isRead: false,
    createdAt: '2025-08-10T10:30:00Z'
  },
  {
    id: 2,
    userId: 1,
    type: 'request_approved',
    title: 'Access Request Approved',
    message: 'Your Switch Room access request REQ-00001 has been approved',
    data: { requestId: 1, requestNumber: 'REQ-00001' },
    isRead: true,
    createdAt: '2025-08-11T14:30:00Z'
  },
  {
    id: 3,
    userId: 6,
    type: 'request_rejected',
    title: 'Access Request Rejected',
    message: 'Your Transmission Room access request REQ-00005 has been rejected. Reason: Insufficient security clearance.',
    data: { requestId: 5, requestNumber: 'REQ-00005' },
    isRead: false,
    createdAt: '2025-08-01T09:00:00Z'
  },
  {
    id: 4,
    userId: 2,
    type: 'urgent_request',
    title: 'Urgent Access Request',
    message: 'REQ-00003: Emergency NOC access request needs immediate attention',
    data: { requestId: 3, requestNumber: 'REQ-00003' },
    isRead: false,
    createdAt: '2025-08-11T09:15:00Z'
  },
  {
    id: 5,
    userId: 3,
    type: 'access_expiring',
    title: 'Temporary Access Expiring',
    message: 'Your temporary Data Center access will expire in 2 days. Please submit renewal request if needed.',
    data: { requestId: 4, requestNumber: 'REQ-00004' },
    isRead: false,
    createdAt: '2025-08-11T08:00:00Z'
  }
];

// Update constants for telecom context
export const FACILITY_TYPES = {
  SWITCH_ROOM: 'switch_room',
  SERVER_ROOM: 'server_room',
  DATA_CENTER: 'data_center',
  NETWORK_OPERATIONS_CENTER: 'network_operations_center',
  TRANSMISSION_ROOM: 'transmission_room',
  TELECOM_EQUIPMENT_ROOM: 'telecom_equipment_room',
  BACKUP_POWER_ROOM: 'backup_power_room',
  MDF_ROOM: 'mdf_room',
  IDF_ROOM: 'idf_room',
  FIBER_SPLICE_ROOM: 'fiber_splice_room'
};

export const SECURITY_CLEARANCE_LEVELS = {
  NONE: 'none',
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  CRITICAL: 'critical'
};

export const TELECOM_SYSTEMS = {
  NETWORK_MANAGEMENT: 'network_management',
  BILLING_SYSTEM: 'billing_system',
  CUSTOMER_MANAGEMENT: 'customer_management',
  INVENTORY_MANAGEMENT: 'inventory_management',
  WORKFORCE_MANAGEMENT: 'workforce_management',
  TROUBLE_TICKETING: 'trouble_ticketing',
  PROVISIONING_SYSTEM: 'provisioning_system',
  MONITORING_TOOLS: 'monitoring_tools',
  CONFIGURATION_MANAGEMENT: 'configuration_management',
  SECURITY_SYSTEMS: 'security_systems'
};



// Enhanced priority and status configurations
export const PRIORITY_CONFIG = {
  [REQUEST_PRIORITY.LOW]: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-800',
    badgeColor: 'bg-gray-500'
  },
  [REQUEST_PRIORITY.NORMAL]: {
    label: 'Normal',
    color: 'bg-blue-100 text-blue-800',
    badgeColor: 'bg-blue-500'
  },
  [REQUEST_PRIORITY.HIGH]: {
    label: 'High',
    color: 'bg-yellow-100 text-yellow-800',
    badgeColor: 'bg-yellow-500'
  },
  [REQUEST_PRIORITY.URGENT]: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800',
    badgeColor: 'bg-red-500'
  }
};

export const STATUS_CONFIG = {
  [REQUEST_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    badgeColor: 'bg-gray-500'
  },
  [REQUEST_STATUS.PENDING]: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    badgeColor: 'bg-yellow-500'
  },
  [REQUEST_STATUS.APPROVED]: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    badgeColor: 'bg-green-500'
  },
  [REQUEST_STATUS.REJECTED]: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    badgeColor: 'bg-red-500'
  },
  [REQUEST_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-600',
    badgeColor: 'bg-gray-400'
  }
};

  
  // Demo Approval Chains
  export const demoApprovalChains = [
    {
      id: 1,
      requestId:1,
      approvalOrder:1,
      approverId: 2,
      approverName: 'System Administrator',
      status: 'pending',
      comments: 'Approved',
      actionDate: '2025-08-07T14:30:00Z',
      signatureApplied: true,
      signature: '/images/signatures/system-admin.png'
    },
    {
      id: 2,
      requestId: 2,
      approvalOrder: 2,
      approverId: 2,
      approverName: 'System Administrator',
      status: 'approved',
      dueDate: '2025-08-15T17:00:00Z',
      createdAt: '2025-08-10T10:30:00Z',
      comments: 'Approved',
      actionDate: '2025-08-06T14:00:00Z',
      signatureApplied: true,
      signature: '/images/signatures/system-admin.png'
    },
    {
      id: 3,
      requestId: 2,
      approvalOrder: 1,
      approverId: 2,
      approverName: 'Jane Smith',
      status: 'approved',
      comments: 'Approved',
      actionDate: '2025-08-06T14:00:00Z',
      signatureApplied: true,
      signature: '/images/signatures/jane-smith.png'
    },
    {
      id: 4,
      requestId: 2,
      approvalOrder: 2,
      approverId: 3,
      approverName: 'System Administrator',
      status: 'approved',
      comments: 'Approved',
      actionDate: '2025-08-07T14:30:00Z',
      signatureApplied: true,
      signature: '/images/signatures/system-admin.png'
    },
    {
      id: 5,
      requestId:6,
      approvalOrder:1,
      approverId: 2,
      approverName: 'System Administrator',
      status: 'approved',
      comments: 'Approved',
      actionDate: '2025-08-07T14:30:00Z',
      signatureApplied: true,
      signature: '/images/signatures/system-admin.png'
    },
    {
      id: 6,
      requestId:6,
      approvalOrder:2,
      approverId: 2,
      approverName: 'System Administrator',
      status: 'approved',
      comments: 'Approved',
      actionDate: '2025-08-07T14:30:00Z',
      signatureApplied: true,
      signature: '/images/signatures/system-admin.png'
    }
  ];
  
