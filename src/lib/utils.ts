export function formatTimeAgo(dateString: string | Date | undefined) {
  if (!dateString) return "just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function generateWhatsAppLink(phone: string, applicantName: string, jobTitle: string) {
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
  
  const message = encodeURIComponent(`Hi ${applicantName}, I saw your application for "${jobTitle}" on FlexiWork. Are you available to discuss this today?`);
  return `https://wa.me/${cleanPhone}?text=${message}`;
}
