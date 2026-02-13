import * as React from "react";
import { cn } from "../utils/cn";
import { User } from "@phosphor-icons/react";

const avatarSizes = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
};

const avatarColors = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-purple-500 to-purple-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-cyan-500 to-cyan-600",
  "from-indigo-500 to-indigo-600",
];

function getColorFromName(name) {
  if (!name) return avatarColors[0];
  const charCode = name.charCodeAt(0);
  return avatarColors[charCode % avatarColors.length];
}

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const Avatar = React.forwardRef(
  (
    {
      className,
      src,
      alt,
      name,
      size = "md",
      showStatus,
      status = "online",
      ...props
    },
    ref,
  ) => {
    const [imgError, setImgError] = React.useState(false);
    const sizeClass = avatarSizes[size] || avatarSizes.md;
    const colorClass = getColorFromName(name);
    const initials = getInitials(name);

    const statusColors = {
      online: "bg-emerald-500",
      offline: "bg-gray-400",
      busy: "bg-red-500",
      away: "bg-amber-500",
    };

    const statusSizes = {
      xs: "w-1.5 h-1.5 border",
      sm: "w-2 h-2 border",
      md: "w-2.5 h-2.5 border-2",
      lg: "w-3 h-3 border-2",
      xl: "w-4 h-4 border-2",
    };

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex shrink-0", className)}
        {...props}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            onError={() => setImgError(true)}
            className={cn(
              "rounded-full object-cover border-2 border-surface",
              sizeClass,
            )}
          />
        ) : initials ? (
          <div
            className={cn(
              "rounded-full flex items-center justify-center font-semibold text-white",
              "bg-linear-to-br shadow-lg",
              colorClass,
              sizeClass,
            )}
          >
            {initials}
          </div>
        ) : (
          <div
            className={cn(
              "rounded-full flex items-center justify-center bg-surface-tertiary text-text-muted",
              sizeClass,
            )}
          >
            <User weight="bold" className="w-1/2 h-1/2" />
          </div>
        )}

        {showStatus && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-surface",
              statusColors[status],
              statusSizes[size],
            )}
          />
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

const AvatarGroup = ({ children, max = 4, size = "md", className }) => {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  const overlapSizes = {
    xs: "-ml-1.5",
    sm: "-ml-2",
    md: "-ml-2.5",
    lg: "-ml-3",
    xl: "-ml-4",
  };

  return (
    <div className={cn("flex items-center", className)}>
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className={cn(index > 0 && overlapSizes[size], "relative")}
          style={{ zIndex: visibleChildren.length - index }}
        >
          {React.cloneElement(child, { size })}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            overlapSizes[size],
            avatarSizes[size],
            "rounded-full flex items-center justify-center bg-surface-tertiary text-text-secondary font-semibold border-2 border-surface",
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export { Avatar, AvatarGroup };
