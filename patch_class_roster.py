import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

# Add Settings and icons to lucide-react imports
content = content.replace("  Mic\n} from 'lucide-react';", "  Mic,\n  Settings,\n  Palette,\n  Star,\n  Heart,\n  Target,\n  Flag,\n  Book,\n  Award,\n  Sparkles,\n  Smile\n} from 'lucide-react';")

# Add classAppearances state
old_state = "  // Students list state"
new_state = """  // Class Appearance state
  const [classAppearances, setClassAppearances] = useState<Record<string, { color: string, icon: string }>>(() => {
    try {
      const saved = localStorage.getItem('school_class_appearances');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('school_class_appearances', JSON.stringify(classAppearances));
  }, [classAppearances]);

  const classKey = `${selectedGrade}_${selectedClassNum}`;
  const currentAppearance = classAppearances[classKey] || { color: 'bg-slate-100 text-slate-800', icon: 'FileText' };

  // Helper to render icon
  const renderIcon = (iconName: string, className: string = "w-4 h-4") => {
    switch(iconName) {
      case 'Star': return <Star className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Target': return <Target className={className} />;
      case 'Flag': return <Flag className={className} />;
      case 'Book': return <Book className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Smile': return <Smile className={className} />;
      default: return <FileText className={className} />;
    }
  };

  const appearanceColors = [
    { id: 'bg-slate-100 text-slate-800 border-slate-200', label: 'رمادي' },
    { id: 'bg-blue-100 text-blue-800 border-blue-200', label: 'أزرق' },
    { id: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'أخضر' },
    { id: 'bg-amber-100 text-amber-800 border-amber-200', label: 'برتقالي' },
    { id: 'bg-rose-100 text-rose-800 border-rose-200', label: 'أحمر' },
    { id: 'bg-purple-100 text-purple-800 border-purple-200', label: 'بنفسجي' },
    { id: 'bg-pink-100 text-pink-800 border-pink-200', label: 'وردي' },
    { id: 'bg-teal-100 text-teal-800 border-teal-200', label: 'فيروزي' },
  ];

  const appearanceIcons = ['FileText', 'Star', 'Heart', 'Target', 'Flag', 'Book', 'Award', 'Sparkles', 'Smile'];

  // Students list state"""

content = content.replace(old_state, new_state)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
