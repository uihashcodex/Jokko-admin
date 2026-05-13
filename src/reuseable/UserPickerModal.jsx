import { useCallback, useEffect, useMemo, useState } from "react";
import { Checkbox, ConfigProvider, Empty, Input, Modal, Segmented, Spin, Tag, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import axios from "axios";
import { constant } from "../const";
import theme from "../config/theme";
import { capitalize } from "../utils/capitalize";

const USER_FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Individual", value: "individual" },
  { label: "Professional", value: "professional" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const sharedProps = {
  spinning: true,
  percent: 0,
};

const EMPTY_SELECTED_USERS = [];

const UserPickerModal = ({
  open,
  onCancel,
  onSubmit,
  submitLoading = false,
  title = "Select Users",
  subtitle = "Choose recipients",
  submitText = "Add Users",
  topContent,
  initialSelectedUsers = EMPTY_SELECTED_USERS,
  userType,
}) => {
  const [usersLoading, setUsersLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userCacheById, setUserCacheById] = useState(new Map());
  const initialSelectedUserIds = useMemo(
    () => initialSelectedUsers.map((user) => user.id).filter(Boolean),
    [initialSelectedUsers]
  );
  const constrainedUserType = ["individual", "professional"].includes(userType)
    ? userType
    : "";
  const filterOptions = useMemo(
    () =>
      constrainedUserType
        ? USER_FILTER_OPTIONS.filter((option) => !["individual", "professional"].includes(option.value))
        : USER_FILTER_OPTIONS,
    [constrainedUserType]
  );

  const fetchUsers = useCallback(async (searchValue = "", filterValue = "all") => {
    setUsersLoading(true);

    const params = {
      page: 1,
      limit: 200,
    };

    const search = searchValue.trim();
    if (search) params.search = search;

    if (constrainedUserType) {
      params.type = constrainedUserType;
    } else if (["individual", "professional"].includes(filterValue)) {
      params.type = filterValue;
    }

    if (filterValue === "active") {
      params.blockstatus = false;
    }

    if (filterValue === "inactive") {
      params.blockstatus = true;
    }

    try {
      const { data } = await axios.get(
        `${constant.backend_url}/admin/pushnotification-userdetails`,
        {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (data.success) {
        const rows = (data.result || []).map((user) => {
          const firstName = user?.firstname || "";
          const lastName = user?.lastname || "";

          return {
            id: user?._id || user?.id,
            name: `${firstName} ${lastName}`.trim() || user?.name || user?.username || "-",
            email: user?.email || "-",
            phone: user?.phone || "-",
            type: user?.type || "-",
            status: user?.blockstatus ? "inactive" : "active",
            uniqueId: user?.unique_id || "",
          };
        });

        const validRows = rows.filter((user) => user.id);

        setUsers(validRows);
        setUserCacheById((prev) => {
          const next = new Map(prev);
          validRows.forEach((user) => next.set(user.id, user));
          return next;
        });
      } else {
        message.error(data.message || "Failed to load users.");
      }
    } catch {
      message.error("Failed to fetch users.");
    } finally {
      setUsersLoading(false);
    }
  }, [constrainedUserType]);

  useEffect(() => {
    if (open) {
      setUserSearch("");
      setUserFilter("all");
      setSelectedUserIds(initialSelectedUserIds);
      setUserCacheById(new Map(initialSelectedUsers.map((user) => [user.id, user])));
      fetchUsers("", "all");
    }
  }, [fetchUsers, initialSelectedUserIds, initialSelectedUsers, open, constrainedUserType]);

  useEffect(() => {
    if (!open) return undefined;
    if (!userSearch && userFilter === "all") return undefined;

    const timer = setTimeout(() => {
      fetchUsers(userSearch, userFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchUsers, open, userFilter, userSearch]);

  const filteredUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        [user.name, user.email, user.phone, user.uniqueId]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));

      const matchesFilter =
        userFilter === "all" ||
        user.type?.toLowerCase() === userFilter ||
        user.status === userFilter;

      const matchesConstrainedType =
        !constrainedUserType || user.type?.toLowerCase() === constrainedUserType;

      return matchesSearch && matchesFilter && matchesConstrainedType;
    });
  }, [constrainedUserType, users, userFilter, userSearch]);

  const selectedUsers = useMemo(
    () =>
      selectedUserIds
        .map((id) => userCacheById.get(id))
        .filter(Boolean),
    [selectedUserIds, userCacheById]
  );

  const visibleUserIds = filteredUsers.map((user) => user.id);
  const allVisibleSelected =
    visibleUserIds.length > 0 &&
    visibleUserIds.every((id) => selectedUserIds.includes(id));

  const toggleVisibleUsers = (checked) => {
    setSelectedUserIds((prev) => {
      if (!checked) {
        return prev.filter((id) => !visibleUserIds.includes(id));
      }

      return Array.from(new Set([...prev, ...visibleUserIds]));
    });
  };

  const handleSubmit = () => {
    if (!selectedUserIds.length) {
      message.error("Please select at least one user.");
      return;
    }

    onSubmit?.({
      userIds: selectedUserIds,
      users: selectedUsers,
      emails: selectedUsers
        .map((user) => user.email)
        .filter((email) => email && email !== "-"),
    });
  };

  return (
    <ConfigProvider theme={{ token: { colorBgElevated: theme.sidebarSettings.backgroundColor } }}>
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        centered
        width="90%"
        style={{ maxWidth: 680 }}
        destroyOnHidden
        className="custom-modal modal-style"
        styles={{
          content: { background: theme.sidebarSettings.backgroundColor, borderRadius: 12 },
          body: { paddingTop: 20, paddingBottom: 20 },
        }}
      >
        <div style={modalStyles.header}>
          <div style={modalStyles.iconWrap}>
            <UserAddOutlined style={{ fontSize: 18, color: "#c9f07b" }} />
          </div>
          <div>
            <p style={modalStyles.title}>{title}</p>
            <p style={modalStyles.subtitle}>{subtitle}</p>
          </div>
        </div>
        <div style={modalStyles.divider} />

        {topContent && <div style={styles.topContent}>{topContent}</div>}

        <div style={styles.toolbar}>
          <Input.Search
            allowClear
            placeholder="Search users by name, email"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="up-user-search"
          />

          <Segmented
            value={userFilter}
            onChange={(value) => setUserFilter(value)}
            options={filterOptions}
            className="up-user-segmented"
          />
        </div>

        <div style={styles.summaryRow}>
          <Checkbox
            checked={allVisibleSelected}
            indeterminate={
              visibleUserIds.some((id) => selectedUserIds.includes(id)) &&
              !allVisibleSelected
            }
            onChange={(e) => toggleVisibleUsers(e.target.checked)}
            disabled={!visibleUserIds.length}
          >
            <span style={styles.checkboxText}>Select visible</span>
          </Checkbox>

          <span style={styles.countText}>{selectedUserIds.length} selected</span>
        </div>

        <div style={styles.list}>
          {usersLoading ? (
            <div style={styles.loadingWrap}>
              <Spin {...sharedProps} styles={{ indicator: { color: "#C9F07B" } }} />
            </div>
          ) : filteredUsers.length ? (
            <Checkbox.Group
              value={selectedUserIds}
              onChange={(values) => {
                setSelectedUserIds((prev) =>
                  Array.from(new Set([
                    ...prev.filter((id) => !visibleUserIds.includes(id)),
                    ...values,
                  ]))
                );
              }}
              style={{ width: "100%" }}
            >
              {filteredUsers.map((user) => (
                <label key={user.id} style={styles.userRow}>
                  <Checkbox value={user.id} />
                  <div style={styles.userMeta}>
                    <div style={styles.userName}>{user.name}</div>
                    <div style={styles.userEmail}>{user.email}</div>
                  </div>
                  <Tag color={user.status === "active" ? "green" : "red"}>
                    {capitalize(user.status)}
                  </Tag>
                  <Tag color={user.type === "professional" ? "blue" : "default"}>
                    {capitalize(user.type)}
                  </Tag>
                </label>
              ))}
            </Checkbox.Group>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span style={{ color: "rgba(255,255,255,0.55)" }}>No users found</span>}
            />
          )}
        </div>

        <div style={modalStyles.btnRow}>
          {!submitLoading ? (
            <>
              <button type="button" onClick={onCancel} style={modalStyles.cancelBtn}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                style={modalStyles.submitBtn}
                className="up-submit-btn"
              >
                {submitText}
              </button>
            </>
          ) : (
            <Spin {...sharedProps} styles={{ indicator: { color: "#C9F07B" } }} />
          )}
        </div>

        <style>{`
          .up-user-search .ant-input,
          .up-user-search .ant-input-affix-wrapper,
          .up-user-search .ant-input-group-addon .ant-btn {
            background-color: #0e2e2a !important;
            border-color: #2e5e4e !important;
            color: #fff !important;
          }
          .up-user-search .ant-input::placeholder {
            color: rgba(255,255,255,0.35) !important;
          }
          .up-user-search .ant-input-search-button {
            color: #c9f07b !important;
          }
          .up-user-segmented {
            background: rgba(255,255,255,0.06) !important;
            padding: 4px !important;
          }
          .up-user-segmented .ant-segmented-item {
            color: rgba(255,255,255,0.72) !important;
          }
          .up-user-segmented .ant-segmented-item-selected {
            background: #c9f07b !important;
            color: #000 !important;
          }
          .up-user-segmented .ant-segmented-thumb {
            background: #c9f07b !important;
          }
          .ant-checkbox-wrapper {
            color: rgba(255,255,255,0.85) !important;
          }
          .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #c9f07b !important;
            border-color: #c9f07b !important;
          }
          .ant-checkbox-checked .ant-checkbox-inner:after {
            border-color: #000 !important;
          }
          .up-submit-btn:hover {
            background-color: #b0d660 !important;
            border-color: #b0d660 !important;
          }
        `}</style>
      </Modal>
    </ConfigProvider>
  );
};

const modalStyles = {
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "rgba(201,240,123,0.1)",
    border: "1px solid rgba(201,240,123,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    margin: 0,
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    margin: 0,
    marginTop: 2,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.07)",
    marginBottom: 20,
  },
  btnRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.65)",
    borderRadius: 8,
    height: 40,
    paddingInline: 16,
    cursor: "pointer",
  },
  submitBtn: {
    background: "#c9f07b",
    border: "1px solid #c9f07b",
    color: "#000",
    fontWeight: 700,
    borderRadius: 8,
    height: 40,
    paddingInline: 24,
    cursor: "pointer",
  },
};

const styles = {
  topContent: {
    marginBottom: 14,
  },
  toolbar: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 14,
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  checkboxText: {
    color: "rgba(255,255,255,0.82)",
    fontWeight: 600,
  },
  countText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
  },
  list: {
    maxHeight: 360,
    overflowY: "auto",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    background: "rgba(0,0,0,0.12)",
    padding: 8,
  },
  loadingWrap: {
    minHeight: 180,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userRow: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto auto",
    alignItems: "center",
    gap: 10,
    padding: "10px 8px",
    borderRadius: 8,
    cursor: "pointer",
  },
  userMeta: {
    minWidth: 0,
  },
  userName: {
    color: "#fff",
    fontWeight: 650,
    fontSize: 14,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userEmail: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 12,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

export default UserPickerModal;
