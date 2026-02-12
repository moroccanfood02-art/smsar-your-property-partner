import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus, Video, Image, Star, Megaphone, FileText, Bell,
  RefreshCw, CheckCircle, Loader2, DollarSign, BarChart3, TrendingUp,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';

interface PromotionData {
  id: string;
  property_id: string;
  property_title: string;
  promotion_type: string;
  video_url: string | null;
  banner_image_url: string | null;
  start_date: string;
  end_date: string;
  amount_paid: number;
  is_active: boolean;
}

interface PropertyData {
  id: string;
  title: string;
  city: string;
  owner_id: string;
}

interface AdminPromotionsTabProps {
  promotions: PromotionData[];
  properties: PropertyData[];
  text: Record<string, string>;
  language: string;
  formatPrice: (price: number, currency?: string) => string;
  formatDate: (date: string) => string;
  showPromotionDialog: boolean;
  setShowPromotionDialog: (v: boolean) => void;
  newPromotion: any;
  setNewPromotion: (v: any) => void;
  bannerFile: File | null;
  setBannerFile: (f: File | null) => void;
  videoFile: File | null;
  setVideoFile: (f: File | null) => void;
  uploadingMedia: boolean;
  checkingExpiring: boolean;
  autoRenewing: boolean;
  onCreatePromotion: () => void;
  onDeactivate: (id: string) => void;
  onCheckExpiring: () => void;
  onAutoRenew: () => void;
  onExportPDF: () => void;
  getPromotionTypeLabel: (type: string) => string;
}

const AdminPromotionsTab = ({
  promotions,
  properties,
  text,
  language,
  formatPrice,
  formatDate,
  showPromotionDialog,
  setShowPromotionDialog,
  newPromotion,
  setNewPromotion,
  bannerFile,
  setBannerFile,
  videoFile,
  setVideoFile,
  uploadingMedia,
  checkingExpiring,
  autoRenewing,
  onCreatePromotion,
  onDeactivate,
  onCheckExpiring,
  onAutoRenew,
  onExportPDF,
  getPromotionTypeLabel,
}: AdminPromotionsTabProps) => {
  const promotionChartData = [
    { name: text.featured, value: promotions.filter((p) => p.promotion_type === 'featured').length, color: '#f59e0b' },
    { name: text.video_ad, value: promotions.filter((p) => p.promotion_type === 'video_ad').length, color: '#8b5cf6' },
    { name: text.banner, value: promotions.filter((p) => p.promotion_type === 'banner').length, color: '#3b82f6' },
    { name: text.homepage, value: promotions.filter((p) => p.promotion_type === 'homepage').length, color: '#ec4899' },
  ].filter((d) => d.value > 0);

  const monthlyRevenueData = (() => {
    const now = new Date();
    const data: { name: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' });
      const monthNum = date.getMonth();
      const year = date.getFullYear();
      const filtered = promotions.filter((p) => {
        const d = new Date(p.start_date);
        return d.getMonth() === monthNum && d.getFullYear() === year;
      });
      data.push({ name: monthKey, revenue: filtered.reduce((s, p) => s + p.amount_paid, 0) });
    }
    return data;
  })();

  const totalRevenue = promotions.reduce((s, p) => s + p.amount_paid, 0);
  const activeCount = promotions.filter((p) => p.is_active).length;
  const expiredCount = promotions.filter((p) => !p.is_active).length;

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'video_ad': return <Video className="h-4 w-4" />;
      case 'banner': return <Image className="h-4 w-4" />;
      case 'homepage': return <Star className="h-4 w-4" />;
      default: return <Megaphone className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: text.featured, value: promotions.filter((p) => p.promotion_type === 'featured' && p.is_active).length, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: text.video_ad, value: promotions.filter((p) => p.promotion_type === 'video_ad' && p.is_active).length, icon: Video, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: text.banner, value: promotions.filter((p) => p.promotion_type === 'banner' && p.is_active).length, icon: Image, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold text-foreground">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              {text.promotionsByType}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={promotionChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {promotionChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {text.monthlyRevenue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="promoRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="url(#promoRevGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Bar */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: language === 'ar' ? 'نشطة' : 'Active', value: activeCount, cls: 'text-green-600' },
              { label: language === 'ar' ? 'منتهية' : 'Expired', value: expiredCount, cls: 'text-red-500' },
              { label: language === 'ar' ? 'متوسط السعر' : 'Avg Price', value: promotions.length > 0 ? formatPrice(totalRevenue / promotions.length) : '—', cls: 'text-blue-600' },
              { label: language === 'ar' ? 'بفيديو' : 'With Video', value: promotions.filter((p) => p.video_url).length, cls: 'text-violet-600' },
              { label: language === 'ar' ? 'ببانر' : 'With Banner', value: promotions.filter((p) => p.banner_image_url).length, cls: 'text-amber-600' },
            ].map(({ label, value, cls }, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-lg font-bold ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <FileText className="h-4 w-4 me-1" /> {text.downloadPDF}
          </Button>
          <Button variant="outline" size="sm" onClick={onCheckExpiring} disabled={checkingExpiring}>
            <Bell className="h-4 w-4 me-1" /> {checkingExpiring ? text.checkingExpiring : text.checkExpiring}
          </Button>
          <Button variant="outline" size="sm" onClick={onAutoRenew} disabled={autoRenewing} className="border-primary text-primary">
            <RefreshCw className={`h-4 w-4 me-1 ${autoRenewing ? 'animate-spin' : ''}`} /> {autoRenewing ? text.autoRenewing : text.autoRenew}
          </Button>
        </div>
        <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 me-1" /> {text.addPromotion}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{text.addPromotion}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
              <div className="p-3 bg-muted/50 rounded-lg">
                <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                  {text.selectProperty}
                </Label>
                <Select value={newPromotion.property_id} onValueChange={(v) => setNewPromotion({ ...newPromotion, property_id: v })}>
                  <SelectTrigger><SelectValue placeholder={text.selectProperty} /></SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title} - {p.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
                  {text.promotionType}
                </Label>
                <Select value={newPromotion.promotion_type} onValueChange={(v) => { setNewPromotion({ ...newPromotion, promotion_type: v }); setVideoFile(null); setBannerFile(null); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured"><span className="flex items-center gap-2"><Star className="h-4 w-4" />{text.featured}</span></SelectItem>
                    <SelectItem value="video_ad"><span className="flex items-center gap-2"><Video className="h-4 w-4" />{text.video_ad}</span></SelectItem>
                    <SelectItem value="banner"><span className="flex items-center gap-2"><Image className="h-4 w-4" />{text.banner}</span></SelectItem>
                    <SelectItem value="homepage"><span className="flex items-center gap-2"><Megaphone className="h-4 w-4" />{text.homepage}</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newPromotion.promotion_type === 'video_ad' || newPromotion.promotion_type === 'homepage') && (
                <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border-2 border-dashed border-violet-300 dark:border-violet-700">
                  <Label className="text-sm font-semibold">{text.uploadVideo} *</Label>
                  <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="mt-2" />
                  {videoFile && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="h-3 w-3" />{videoFile.name}</p>}
                  <Input value={newPromotion.video_url} onChange={(e) => setNewPromotion({ ...newPromotion, video_url: e.target.value })} placeholder="https://..." className="mt-2" />
                </div>
              )}

              {(newPromotion.promotion_type === 'banner' || newPromotion.promotion_type === 'homepage') && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
                  <Label className="text-sm font-semibold">{text.bannerImage} *</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} className="mt-2" />
                  {bannerFile && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="h-3 w-3" />{bannerFile.name}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{text.duration}</Label>
                  <Input type="number" value={newPromotion.duration_days} onChange={(e) => setNewPromotion({ ...newPromotion, duration_days: parseInt(e.target.value) })} min={1} />
                </div>
                <div>
                  <Label>{text.amountPaid} ($)</Label>
                  <Input type="number" value={newPromotion.amount_paid} onChange={(e) => setNewPromotion({ ...newPromotion, amount_paid: parseFloat(e.target.value) })} min={0} />
                </div>
              </div>

              <Button onClick={onCreatePromotion} disabled={!newPromotion.property_id || uploadingMedia} className="w-full">
                {uploadingMedia ? <><Loader2 className="h-4 w-4 animate-spin me-2" />{text.uploading}</> : <><Plus className="h-4 w-4 me-2" />{text.create}</>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promotions Table */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{text.property}</TableHead>
                <TableHead>{text.promotionType}</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>{text.amountPaid}</TableHead>
                <TableHead>{text.endDate}</TableHead>
                <TableHead>{text.status}</TableHead>
                <TableHead>{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium max-w-[150px] truncate">{promo.property_title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPromotionIcon(promo.promotion_type)}
                      {getPromotionTypeLabel(promo.promotion_type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {promo.banner_image_url && (
                        <a href={promo.banner_image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                          <Image className="h-3 w-3" />{text.viewBanner}
                        </a>
                      )}
                      {promo.video_url && (
                        <a href={promo.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-500 hover:underline flex items-center gap-1">
                          <Video className="h-3 w-3" />{text.viewVideo}
                        </a>
                      )}
                      {!promo.banner_image_url && !promo.video_url && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{formatPrice(promo.amount_paid)}</TableCell>
                  <TableCell className="text-sm">{formatDate(promo.end_date)}</TableCell>
                  <TableCell>
                    <Badge variant={promo.is_active ? 'default' : 'secondary'}>
                      {promo.is_active ? text.active : text.expired}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {promo.is_active && (
                      <Button variant="destructive" size="sm" onClick={() => onDeactivate(promo.id)}>
                        {text.deactivate}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPromotionsTab;
