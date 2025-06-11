import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MicroInteractionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  soundEffect?: boolean;
}

export function MicroInteractionButton({
  children,
  onClick,
  variant = "default",
  size = "default",
  className,
  disabled = false,
  type = "button",
  soundEffect = true,
  ...props
}: MicroInteractionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // إضافة تأثير الموجة
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    // إزالة التأثير بعد انتهاء الأنيميشن
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    // تشغيل الصوت (اختياري)
    if (soundEffect) {
      playClickSound();
    }

    // استدعاء الدالة المخصصة
    onClick?.();
  };

  const playClickSound = () => {
    // إنشاء صوت نقرة بسيط باستخدام Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant={variant}
        size={size}
        type={type}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden select-none",
          "transition-all duration-200 ease-out",
          "hover:shadow-lg hover:shadow-purple-500/25",
          "active:shadow-sm",
          isPressed && "scale-95",
          className
        )}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onClick={handleClick}
        {...props}
      >
        {/* محتوى الزر */}
        <span className="relative z-10 flex items-center">
          {children}
        </span>

        {/* تأثيرات الموجة */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 10, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}

        {/* تأثير الإضاءة عند التمرير */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
          animate={{
            translateX: isPressed ? "200%" : "-100%",
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
        />

        {/* شريط التحميل (عند الضغط) */}
        {isPressed && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </Button>
    </motion.div>
  );
}