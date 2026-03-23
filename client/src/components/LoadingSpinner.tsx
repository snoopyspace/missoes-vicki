export function LoadingSpinner({ 
  size = "md", 
  message = "Carregando..." 
}: { 
  size?: "sm" | "md" | "lg"; 
  message?: string;
}) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-purple-600 animate-spin" />
        
        {/* Inner rotating ring (opposite direction) */}
        <div className="absolute inset-2 rounded-full border-3 border-transparent border-b-pink-500 border-l-pink-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full animate-pulse" />
        </div>
      </div>
      
      {message && (
        <p className="text-purple-700 font-semibold text-center">{message}</p>
      )}
    </div>
  );
}
