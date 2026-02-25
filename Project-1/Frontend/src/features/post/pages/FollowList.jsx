import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useAuth } from "../../auth/hooks/useAuth";
import BottomNav from "../components/BottomNav";
import { BackIcon } from "../components/icons";
import UserListItem from "../components/UserListItem";
import { getFollowersList, getFollowingList } from "../services/user.network.api";
import "../style/FollowList.scss";

const FollowList = ({ listType = "followers" }) => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const pageTitle = useMemo(
    () => (listType === "following" ? "Following" : "Followers"),
    [listType],
  );

  useEffect(() => {
    let mounted = true;

    async function loadList() {
      if (!username) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          listType === "following"
            ? await getFollowingList(username)
            : await getFollowersList(username);

        const rows = listType === "following"
          ? response?.following || []
          : response?.followers || [];

        if (mounted) {
          setItems(rows);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || "Failed to load users");
          setItems([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadList();

    return () => {
      mounted = false;
    };
  }, [listType, username]);

  return (
    <main className="ig-feed-page">
      <div className="ig-phone-shell">
        <header className="ig-detail-nav">
          <button
            type="button"
            className="ig-icon-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <BackIcon className="ig-icon" />
          </button>
          <p>{pageTitle}</p>
          <span className="ig-detail-nav__spacer" />
        </header>

        <section className="ig-scroll-area ig-user-list">
          <p className="ig-user-list__context">@{username}</p>
          {error ? <p className="ig-error">{error}</p> : null}
          {loading ? <p className="ig-loading">Loading {pageTitle.toLowerCase()}...</p> : null}
          {!loading && !error && !items.length ? (
            <p className="ig-loading">
              No {pageTitle.toLowerCase()} found.
            </p>
          ) : null}
          {items.map((entry) => (
            <UserListItem
              key={`${listType}-${entry.userName}`}
              user={entry}
              onOpenProfile={(name) => navigate(`/profile/${name}`)}
            />
          ))}
        </section>

        <BottomNav active="profile" currentUser={user} />
      </div>
    </main>
  );
};

export default FollowList;
