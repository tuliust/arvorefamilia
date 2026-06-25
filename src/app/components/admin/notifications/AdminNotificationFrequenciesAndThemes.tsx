import {
  AdminNotificationThemeId,
  ADMIN_NOTIFICATION_FREQUENCY_OPTIONS,
  ADMIN_NOTIFICATION_THEME_OPTIONS,
} from '../../../constants/adminNotificationCatalog';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

export function AdminNotificationFrequenciesAndThemes(props: {
  frequencyUsage: Record<string, number>;
  themeUsage: Record<AdminNotificationThemeId, number>;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequências de envio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ADMIN_NOTIFICATION_FREQUENCY_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              <Badge variant="secondary">{props.frequencyUsage[option.id] || 0} tipos</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Temas e tom das mensagens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ADMIN_NOTIFICATION_THEME_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              <Badge variant="outline">{props.themeUsage[option.id] || 0} templates</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
