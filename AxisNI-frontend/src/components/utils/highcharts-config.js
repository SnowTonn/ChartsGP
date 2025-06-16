import Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import Accessibility from 'highcharts/modules/accessibility';
import Drilldown from 'highcharts/modules/drilldown';
import OfflineExporting from 'highcharts/modules/offline-exporting';
import Annotations from 'highcharts/modules/annotations';

[Exporting, Accessibility, Drilldown, OfflineExporting, Annotations].forEach((mod) => {
  if (typeof mod === 'function') {
    mod(Highcharts);
  }
});

export default Highcharts;
