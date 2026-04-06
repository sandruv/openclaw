import { apiRequest } from './api/clientConfig';

type ExportResponse = {
  status: 'success' | 'error';
  message: string;
  data?: Blob;
};
class ExportService {
  static async exportTasksToExcel(): Promise<ExportResponse> {
    try {
      const url = '/export/tickets';

      const response = await apiRequest<ArrayBuffer>(url, {
        method: 'GET',
        headers: {
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'arraybuffer', 
      });

      const excelBlob = new Blob([response], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      return {
        status: 'success',
        message: 'Tasks exported successfully',
        data: excelBlob,
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to export tasks',
      };
    }
  }


  static async exportTimeEntriesToExcel(): Promise<ExportResponse> {
    try {
      const url = '/export/timelogs';

      const response = await apiRequest<ArrayBuffer>(url, {
        method: 'GET',
        headers: {
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'arraybuffer', 
      });

      const excelBlob = new Blob([response], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      return {
        status: 'success',
        message: 'Time Entries exported successfully',
        data: excelBlob,
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to export time entries',
      };
    }
  }

  static async exportActivitiesToExcel(): Promise<ExportResponse> {
    try {
      const url = '/export/activities';

      const response = await apiRequest<ArrayBuffer>(url, {
        method: 'GET',
        headers: {
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'arraybuffer', 
      });

      const excelBlob = new Blob([response], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      return {
        status: 'success',
        message: 'Activities exported successfully',
        data: excelBlob,
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to export activities',
      };
    }
  }

  static downloadExcel(blob: Blob, download_name: string): void {
    try {
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${download_name}-export-${formatDateTimeForFilename()}.xlsx`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to download Excel file'
      );
    }
  }
}

export const {
  exportTasksToExcel,
  exportTimeEntriesToExcel,
  exportActivitiesToExcel,
  downloadExcel,
} = ExportService;

function formatDateTimeForFilename(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const yyyy = date.getFullYear();

  let hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const hh = pad(hours);
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  return `${mm}-${dd}-${yyyy} ${hh}-${min}-${ss} ${ampm}`;
}