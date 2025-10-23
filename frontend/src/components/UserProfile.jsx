import React, { useState, useRef, useEffect } from 'react'
import { getProfile, getUserPosts } from '../utils/web3.js'

// Props:
// - initialUser: { name, address, avatarUrl, coverUrl, followers, following }
// - posts: array of { id, text, createdAt }
// - onSave: async function(updatedUser) => void
const UserProfile = ({ initialUser = null, posts = [], onSave, userAddress = null, onBack = null }) => {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState((initialUser && initialUser.name) || '')
  const [avatarUrl, setAvatarUrl] = useState((initialUser && initialUser.avatarUrl) || '')
  const [coverUrl, setCoverUrl] = useState((initialUser && initialUser.coverUrl) || '')
  const [saving, setSaving] = useState(false)
  const [fetchedPosts, setFetchedPosts] = useState(posts || [])
  const [loading, setLoading] = useState(false)

  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
  }

  const handleCoverChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setCoverUrl(url)
  }

  const handleSave = async () => {
    if (onSave) {
      setSaving(true)
      try {
        await onSave({ ...initialUser, name, avatarUrl, coverUrl })
      } catch (err) {
        console.error('save failed', err)
      } finally {
        setSaving(false)
        setEditing(false)
      }
    } else {
      setEditing(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      if (!initialUser && userAddress) {
        setLoading(true)
        try {
          const p = await getProfile(userAddress)
          setName(p.username || '')
          setAvatarUrl(p.avatarCID || '')
          // try load posts ids and map to simple objects (content not fetched here)
          const postIds = await getUserPosts(userAddress)
          const simplePosts = postIds.map(id => ({ id, text: `Post #${id}`, createdAt: '' }))
          setFetchedPosts(simplePosts)
        } catch (err) {
          console.error('Failed to load profile/posts', err)
        } finally {
          setLoading(false)
        }
      }
    }
    load()
  }, [initialUser, userAddress])

  return (
    <>
      <style>{`
        .profile-page {
          font-family: Inter, Arial, sans-serif;
          color: #0b3b36;
        }
        .profile-cover {
          height: 180px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .profile-cover-actions {
          position: absolute;
          right: 16px;
          bottom: 12px;
        }
        .container {
          display: flex;
          gap: 24px;
          padding: 20px;
        }
        .profile-left {
          width: 320px;
        }
        .avatar-wrap {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }
        .btn {
          background: #ffffffcc;
          border: 1px solid #ddd;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn.primary {
          background: #20a39e;
          color: #fff;
          border: none;
        }
        .btn.small {
          padding: 6px 8px;
          font-size: 12px;
        }
        .profile-info { margin-top: 12px }
        .name { margin: 6px 0 }
        .name-input { font-size: 20px; padding: 8px; width: 100%; box-sizing: border-box }
        .address { color: #666; font-size: 13px }
        .follow-stats { margin-top: 8px; display:flex; gap:12px; color:#666 }
        .profile-actions { margin-top: 12px }
        .profile-right { flex: 1 }
        .posts-section { background: #fff; padding: 12px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06) }
        .post-card { border-bottom: 1px solid #eee; padding: 12px 0 }
        .post-header { display:flex; gap: 12px; align-items:center }
        .post-avatar { width:36px; height:36px; border-radius:50%; object-fit:cover }
        .post-author { font-weight:600 }
        .post-body { margin-top:8px }
        .empty-state { padding: 36px; text-align:center; color:#777 }
      `}</style>

      <div className="profile-page">
        <div
          className="profile-cover"
          style={{ backgroundImage: `url(${coverUrl || '/default-cover.jpg'})` }}
        >
          <div className="profile-cover-actions">
            {editing && (
              <>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  style={{ display: 'none' }}
                  data-testid="cover-input"
                />
                <button className="btn" onClick={() => coverInputRef.current && coverInputRef.current.click()}>Change Cover</button>
              </>
            )}
          </div>
        </div>

        <div className="profile-main container">
          <div className="profile-left">
            <div className="avatar-wrap">
              <img className="avatar" src={avatarUrl || '/default-avatar.png'} alt="avatar" />
              {editing && (
                <>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                    data-testid="avatar-input"
                  />
                  <button className="btn small" onClick={() => avatarInputRef.current && avatarInputRef.current.click()}>Change</button>
                </>
              )}
            </div>

            <div className="profile-info">
              {editing ? (
                <input className="name-input" value={name} onChange={e => setName(e.target.value)} />
              ) : (
                <h2 className="name">{name || 'Unnamed User'}</h2>
              )}
              <div className="address">{initialUser.address ? `Id - ${initialUser.address}` : ''}</div>

              <div className="follow-stats">
                <span>{initialUser.followers || 0} Followers</span>
                <span>{initialUser.following || 0} Following</span>
              </div>

              <div className="profile-actions">
                {onBack && (
                  <button className="btn" onClick={onBack} style={{ marginRight: 8 }}>Back</button>
                )}
                {editing ? (
                  <>
                    <button className="btn primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    <button className="btn" onClick={() => { setEditing(false); setName((initialUser && initialUser.name) || '') }}>Cancel</button>
                  </>
                ) : (
                  <button className="btn primary" onClick={() => setEditing(true)}>Edit Profile</button>
                )}
              </div>
            </div>
          </div>

          <div className="profile-right">
            <div className="posts-section">
              <h3>Recent posts</h3>
              {Array.isArray(fetchedPosts) && fetchedPosts.length > 0 ? (
                fetchedPosts.map(post => (
                  <div className="post-card" key={post.id}>
                    <div className="post-header">
                      <img className="post-avatar" src={avatarUrl || '/default-avatar.png'} alt="avatar" />
                      <div>
                        <div className="post-author">{name || initialUser.name || 'User'}</div>
                        <div className="post-time">{post.createdAt || ''}</div>
                      </div>
                    </div>
                    <div className="post-body">{post.text}</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No recent posts</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserProfile
