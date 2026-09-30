export default function StatusBadge({ status }) {
  const map = {
    verified:     'badge-verified',
    rejected:     'badge-rejected',
    needs_review: 'badge-review',
    pending:      'badge-pending',
    processing:   'badge-processing',
    error:        'badge-error',
    completed:    'badge-verified',
    failed:       'badge-error',
    flagged:      'badge-review',
    queued:       'badge-pending',
  };
  const labels = {
    verified: 'Verified', rejected: 'Rejected', needs_review: 'Needs Review',
    pending: 'Pending', processing: 'Processing', error: 'Error',
    completed: 'Completed', failed: 'Failed', flagged: 'Flagged', queued: 'Queued',
  };
  return (
    <span className={map[status] || 'badge-pending'}>
      {labels[status] || status || 'Unknown'}
    </span>
  );
}
