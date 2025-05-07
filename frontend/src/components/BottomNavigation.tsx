import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Video,
  FileText,
  MessageSquare,
  BookOpen,
  Wrench,
  Newspaper,
  Image,
  MessageCircle,
} from 'lucide-react'

interface Tab {
  id: number
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  path: string
  exact?: boolean
}

interface BottomNavigationProps {
  activeTab: number
  onTabChange: (tabId: number) => void
}

export const mainTabs: Tab[] = [
  {
    id: 0,
    title: 'داشبورد',
    icon: LayoutDashboard,
    path: '/',
    exact: true
  },
  {
    id: 1,
    title: 'ابزارها',
    icon: Wrench,
    path: '/tools'
  },
  {
    id: 2,
    title: 'مقالات',
    icon: Newspaper,
    path: '/articles'
  },
  {
    id: 3,
    title: 'رسانه',
    icon: Image,
    path: '/media'
  },
  {
    id: 4,
    title: 'مشاوره',
    icon: MessageCircle,
    path: '/consultation'
  }
]

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  const isTabActive = (tab: Tab) => {
    if (tab.exact) {
      return pathname === tab.path
    }
    return pathname.startsWith(tab.path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {mainTabs.map((tab) => {
            const isActive = isTabActive(tab)
            const Icon = tab.icon
            
            return (
              <Button
                key={tab.path}
                variant="ghost"
                size="icon"
                className={`flex flex-col items-center justify-center h-full w-full relative ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
                onClick={() => handleTabClick(tab.path)}
              >
                <div className={`absolute inset-0 bg-primary/10 rounded-t-lg transition-all duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`} />
                <Icon className={`h-5 w-5 transition-all duration-200 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`} />
                <span className={`text-xs mt-1 transition-all duration-200 ${
                  isActive ? 'font-medium' : 'font-normal'
                }`}>{tab.title}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}