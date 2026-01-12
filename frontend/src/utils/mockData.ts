// Mock data for offline demo purposes
// This file contains data that mimics what would normally come from the backend API

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface Document {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Compliance {
  _id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  completedDate?: string;
}

export interface Site {
  _id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: string;
}

// Mock user data
export const mockCurrentUser: User = {
  _id: "user123",
  name: "Demo User",
  email: "demo@earthsafe.com",
  role: "miner"
};

// Mock documents data
export const mockDocuments: Document[] = [
  {
    _id: "doc1",
    title: "Mining Permit",
    description: "Official permit for small-scale mining operations",
    fileUrl: "assets/sample-doc.pdf",
    status: "approved",
    createdAt: "2023-12-01T08:30:00Z",
    updatedAt: "2023-12-10T14:20:00Z"
  },
  {
    _id: "doc2",
    title: "Environmental Assessment",
    description: "Environmental impact assessment for mining site",
    fileUrl: "assets/sample-doc.pdf",
    status: "pending",
    createdAt: "2024-01-15T10:45:00Z",
    updatedAt: "2024-01-15T10:45:00Z"
  },
  {
    _id: "doc3",
    title: "Safety Compliance Report",
    description: "Annual safety compliance documentation",
    fileUrl: "assets/sample-doc.pdf",
    status: "rejected",
    createdAt: "2024-02-20T09:15:00Z",
    updatedAt: "2024-02-25T11:30:00Z"
  }
];

// Mock compliance requirements
export const mockCompliance: Compliance[] = [
  {
    _id: "comp1",
    title: "Annual Safety Training",
    description: "All miners must complete annual safety training",
    status: "completed",
    dueDate: "2024-01-30T00:00:00Z",
    completedDate: "2024-01-25T14:30:00Z"
  },
  {
    _id: "comp2",
    title: "Environmental Audit",
    description: "Site must be inspected for environmental compliance",
    status: "pending",
    dueDate: "2024-05-15T00:00:00Z"
  },
  {
    _id: "comp3",
    title: "Equipment Certification",
    description: "All mining equipment must be certified by regulatory body",
    status: "overdue",
    dueDate: "2024-02-28T00:00:00Z"
  }
];

// Mock mining sites
export const mockSites: Site[] = [
  {
    _id: "site1",
    name: "Riverside Mining Site",
    location: {
      latitude: -17.824858,
      longitude: 31.053028
    },
    status: "active"
  },
  {
    _id: "site2",
    name: "Eastern Valley Excavation",
    location: {
      latitude: -17.783333,
      longitude: 31.1
    },
    status: "inactive"
  }
];

// Add more mock data as needed for your demo 