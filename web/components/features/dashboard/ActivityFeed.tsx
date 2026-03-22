import { formatDistanceToNow } from "date-fns";

interface Enrollment {
  id: string;
  learnerName: string;
  courseTitle: string;
  amountPaidCents: number;
  enrolledAt: number;
}

export function ActivityFeed({ enrollments }: { enrollments: Enrollment[] }) {
  if (enrollments.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4 text-center">
        No enrollments yet — your first sale will appear here.
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {enrollments.map((e) => (
        <div key={e.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-slate-900">{e.learnerName}</p>
            <p className="text-xs text-slate-500">{e.courseTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-emerald-600">
              +${(e.amountPaidCents / 100).toFixed(2)}
            </p>
            <p className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(e.enrolledAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
