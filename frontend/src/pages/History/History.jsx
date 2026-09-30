import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, RefreshCw } from 'lucide-react'
import HistoryTable from '../../components/Tables/HistoryTable'
import Loader from '../../components/Loader/Loader'
import Modal from '../../components/Modal/Modal'
import { verificationAPI } from '../../api/verification'

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [page, setPage] = useState(0)
  const pageSize = 20
  const navigate = useNavigate()

  useEffect(() => {
    loadHistory()
  }, [statusFilter, typeFilter, page])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const params = {
        limit: pageSize,
        offset: page * pageSize,
      }
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.document_type = typeFilter

      const result = await verificationAPI.getHistory(params)
      setHistory(result.history || [])
    } catch (err) {
      console.error('Failed to load history:', err)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = searchQuery
    ? history.filter(item => {
        const doc = item.documents || {}
        const name = (doc.file_name || '').toLowerCase()
        return name.includes(searchQuery.toLowerCase())
      })
    : history

  const handleViewDetails = (item) => {
    navigate(`/verification?doc=${item.document_id}`)
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Verification History</h1>
        <p>View all your past document verification attempts</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="form-input-icon" style={{ flex: 1, maxWidth: '300px' }}>
          <Search size={16} className="icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by document name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="history-search"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
          id="history-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="manual_review">Manual Review</option>
        </select>

        <select
          className="form-select"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0) }}
          id="history-type-filter"
        >
          <option value="">All Types</option>
          <option value="aadhaar">Aadhaar Card</option>
          <option value="pan_card">PAN Card</option>
          <option value="passport">Passport</option>
          <option value="driving_license">Driving License</option>
          <option value="voter_id">Voter ID</option>
        </select>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { setPage(0); loadHistory() }}
          id="history-refresh"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <Loader text="Loading history..." />
      ) : (
        <>
          <HistoryTable
            data={filteredHistory}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          {history.length > 0 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="pagination-btn active">{page + 1}</span>
              <button
                className="pagination-btn"
                disabled={history.length < pageSize}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
