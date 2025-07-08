// Utility function to generate avatar URL or initials
export const getAvatarDisplay = (user) => {
  // If user has an avatar URL, use it
  if (user.avatar && user.avatar.startsWith("http")) {
    return {
      type: "image",
      src: user.avatar,
      alt: user.name || user.email,
    };
  }

  // Generate initials from name or email
  const name = user.name || user.email || "User";
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate a consistent color based on user ID
  const colors = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-blue-600",
    "from-purple-500 to-pink-600",
    "from-red-500 to-orange-600",
    "from-yellow-500 to-red-600",
    "from-indigo-500 to-purple-600",
    "from-pink-500 to-rose-600",
    "from-teal-500 to-cyan-600",
  ];

  const colorIndex = (user.id || 0) % colors.length;

  return {
    type: "initials",
    initials,
    gradient: colors[colorIndex],
  };
};
