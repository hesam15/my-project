import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, Edit, Trash2, Eye } from 'lucide-react';

export default function PrimaryContentPage() {
  return (
    <div className="space-y-6 w-full px-0">
      <div className="flex justify-between items-center">
        <Button className="flex items-center">
          <Star className="w-4 h-4 ml-2" />
          افزودن محتوای ویژه
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4">عنوان</th>
                  <th className="text-right py-3 px-4">نوع محتوا</th>
                  <th className="text-right py-3 px-4">قیمت</th>
                  <th className="text-right py-3 px-4">تعداد خرید</th>
                  <th className="text-right py-3 px-4">وضعیت</th>
                  <th className="text-right py-3 px-4">عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">هیچ محتوای ویژه‌ای یافت نشد</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
} 