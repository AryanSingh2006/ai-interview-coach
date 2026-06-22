export const initialSettingsData = {
  profile: {
    fullName: "Alexander Morgan",
    email: "alex.m@interviewpro.ai",
    professionalTitle: "Senior Talent Acquisition Lead"
  },
  notifications: [
    { id: "reminders", label: "Interview Reminders", description: "Receive alerts 30 minutes before scheduled interviews.", active: true },
    { id: "reports", label: "AI Analysis Reports", description: "Get a digest when a candidate report is ready.", active: true },
    { id: "updates", label: "Platform Updates", description: "Stay updated with new features and improvements.", active: false }
  ],
  themes: [
    { id: "light", label: "Light Mode" },
    { id: "dark", label: "Dark Mode" },
    { id: "system", label: "System" }
  ]
};