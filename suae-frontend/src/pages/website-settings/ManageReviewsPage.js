import React, { useEffect, useState } from 'react';
import axiosnode from '../../utils/axiosnode';
import util from '../../utils/util';
import { message, Modal } from 'antd';

export default function ManageReviewsPage({ onBack }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isSuperAdmin =
    util.isAdmin() === 1 ||
    util.isClientAdmin() === 1;

  const fetchReviews = async () => {
    if (!isSuperAdmin) return;

    setLoading(true);

    try {
      const url =
        statusFilter === 'ALL'
          ? '/master/reviews'
          : `/master/reviews?status=${statusFilter}`;

      const response = await axiosnode.get(url);

      if (response?.data?.data) {
        setReviews(response.data.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      message.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosnode.put(
        `/master/reviews/${id}/status`,
        { status }
      );

      message.success(
        `Review status updated to ${status}`
      );

      fetchReviews();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this review?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',

      onOk: async () => {
        try {
          await axiosnode.delete(
            `/master/reviews/${id}`
          );

          message.success(
            'Review deleted successfully'
          );

          fetchReviews();
        } catch (error) {
          console.error(
            'Error deleting review:',
            error
          );

          message.error(
            'Failed to delete review'
          );
        }
      }
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="text-warning">
        {Array.from({ length: 5 }, (_, index) => (
          <i
            key={index}
            className={`fa${
              index < rating ? 's' : 'r'
            } fa-star`}
            style={{
              marginRight: '2px',
              color:
                index < rating
                  ? '#FACC15'
                  : '#ccc'
            }}
          />
        ))}
      </div>
    );
  };

  if (!isSuperAdmin) {
    return (
      <div
        className={
          onBack
            ? 'reviews-settings-card reviews-settings-flat'
            : 'page-pad'
        }
      >
        <div className="text-center py-5 border bg-white p-5">
          <i className="fa fa-exclamation-triangle fa-3x text-danger mb-3" />

          <h3>Access Denied</h3>

          <p className="text-muted">
            Only Super Admins are authorized to
            manage reviews on this platform.
          </p>

          {onBack && (
            <button
              type="button"
              className="btn-back mt-3"
              onClick={onBack}
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        onBack
          ? 'reviews-settings-card reviews-settings-flat'
          : ''
      }
    >
      <div
        className={
          onBack
            ? 'reviews-settings-body'
            : 'page-pad'
        }
      >
        <div className="reviews-filter-row mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="btn-group">
            {[
              'ALL',
              'PENDING',
              'APPROVED',
              'REJECTED'
            ].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setStatusFilter(status)
                }
                className={`btn btn-sm ${
                  statusFilter === status
                    ? 'btn-primary'
                    : 'btn-outline-secondary'
                }`}
                style={{
                  marginRight: '5px'
                }}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="text-secondary text-sm">
            Total Reviews: {reviews.length}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <i className="fa fa-spinner fa-spin fa-2x text-muted mb-2" />

            <div>Loading reviews...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-5 border bg-light">
            <i className="fa fa-comments fa-3x text-muted mb-3" />

            <h4>No reviews found</h4>

            <p className="text-muted">
              No student reviews matched the
              current filter.
            </p>
          </div>
        ) : (
          <div className="reviews-table-wrap table-responsive border bg-white shadow-sm">
            <table
              className="table table-bordered table-md table-striped table-hover m-0"
              style={{
                minWidth: '1000px'
              }}
            >
              <thead className="thead-light text-uppercase">
                <tr>
                  <th
                    className="text-center"
                    style={{
                      width: '50px'
                    }}
                  >
                    SN
                  </th>

                  <th>Student</th>

                  <th>Details</th>

                  <th>Rating &amp; Title</th>

                  <th>Review Comments</th>

                  <th
                    className="text-center"
                    style={{
                      width: '110px'
                    }}
                  >
                    Status
                  </th>

                  <th
                    className="text-center"
                    style={{
                      width: '140px'
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="table-text-top">
                {reviews.map(
                  (review, index) => (
                    <tr key={review.id}>
                      <td className="text-center font-weight-bold">
                        {index + 1}.
                      </td>

                      <td>
                        <div className="font-weight-bold text-dark">
                          {review.name}
                        </div>

                        <div className="text-muted text-xs">
                          {review.email}
                        </div>
                      </td>

                      <td>
                        {review.university_name ? (
                          <div className="font-weight-bold text-[#182b67]">
                            {
                              review.university_name
                            }
                          </div>
                        ) : (
                          <span className="text-muted text-italic">
                            No University Selected
                          </span>
                        )}

                        {review.course_name && (
                          <div className="text-muted text-xs mt-1">
                            Course:{' '}
                            <span className="font-semibold">
                              {
                                review.course_name
                              }
                            </span>
                          </div>
                        )}
                      </td>

                      <td>
                        {renderStars(
                          review.rating
                        )}

                        <div className="font-weight-bold mt-1 text-dark">
                          {review.title}
                        </div>
                      </td>

                      <td>
                        <div
                          className="text-muted text-sm font-normal"
                          style={{
                            whiteSpace:
                              'pre-wrap',
                            maxWidth: '350px'
                          }}
                        >
                          {
                            review.review_text
                          }
                        </div>

                        <div className="text-xs text-muted mt-2">
                          Submitted:{' '}
                          {review.created_at
                            ? new Date(
                                review.created_at
                              ).toLocaleString()
                            : 'N/A'}
                        </div>
                      </td>

                      <td className="text-center">
                        <span
                          className={`badge ${
                            review.status ===
                            'APPROVED'
                              ? 'badge-success'
                              : review.status ===
                                  'REJECTED'
                                ? 'badge-danger'
                                : 'badge-warning'
                          }`}
                          style={{
                            fontSize: '11px',
                            padding:
                              '5px 10px'
                          }}
                        >
                          {review.status}
                        </span>
                      </td>

                      <td className="text-center">
                        <div className="d-flex justify-content-center align-items-center gap-1">
                          {review.status !==
                            'APPROVED' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStatus(
                                  review.id,
                                  'APPROVED'
                                )
                              }
                              className="btn btn-sm btn-success mr-1"
                              title="Approve Review"
                            >
                              <i className="fa fa-check" />
                            </button>
                          )}

                          {review.status !==
                            'REJECTED' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStatus(
                                  review.id,
                                  'REJECTED'
                                )
                              }
                              className="btn btn-sm btn-outline-danger mr-1"
                              title="Reject Review"
                            >
                              <i className="fa fa-times" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                review.id
                              )
                            }
                            className="btn btn-sm btn-danger"
                            title="Delete Review"
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}