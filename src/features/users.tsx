import { EyeOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Select, Spin, Table, Tag } from "antd";
import Search from "antd/es/transfer/search";
import Paragraph from "antd/es/typography/Paragraph";
import { useNavigate, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../utils/index.axios";
import AvatarDefault from "./avatar";

const UsersList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchValue = searchParams.get("searchValue") || null;
  const userType = searchParams.get("userType") || null;
  const hasToken = !!localStorage.getItem("token");
  const {
    data: users,
    isPending,
    isError,
  } = useQuery({
    queryFn: () =>
      getusers({
        page: 1,
        perPage: 200,
        userType,
        search: searchValue!,
      }),
    queryKey: ["users-list", { searchValue, userType }],
    enabled: hasToken,
  });
  const { data: userTypes } = useQuery({
    queryFn: () => getUserTypes(),
    queryKey: ["users-types"],
  });

  const { mutate: authorizeUser } = useMutation({
    mutationFn: (id: string) => autoConect(id),
    onSuccess: (res) => {
      const token = res.data.tokens.accessToken;
      const newParams: any = {};
      userType && (newParams.userType = userType);
      searchValue && (newParams.searchValue = searchValue);
      setSearchParams({ ...newParams, token });
    },
  });
  const dataSource = users?.docs;

  const onSearch = (e: any) => {
    const newParams: any = { searchValue: e.target.value! };
    userType && (newParams.userType = userType);
    setSearchParams(newParams);
  };

  const columns = [
    {
      title: "UserName",
      dataIndex: "userName",
      key: "userName",
      render: (
        _: any,
        record: { profilePicUrl: string | undefined; userName: any; name: any }
      ) => {
        console.log({ record });
        return (
          <div className="user">
            <AvatarDefault profilePicUrl={record.profilePicUrl} />
            <Paragraph copyable={{ text: record.userName || record.name }}>
              {record.userName || record.name}
            </Paragraph>
          </div>
        );
      },
    },
    {
      title: "UserType",
      dataIndex: "userType",
      key: "userType",
      render: (_: any, record: { userType: { name: any } }) => {
        const userType = record?.userType.name;
        return (
          <Tag color={userType === "PLAYER" ? "volcano" : "purple"}>
            {userType}
          </Tag>
        );
      },
    },
    {
      title: "Id",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => {
        return <Paragraph copyable={{ text: text }}>{text}</Paragraph>;
      },
    },
    {
      title: "action",
      dataIndex: "action",
      key: "action",
      render: (_: any, record: any) => {
        return (
          <Button
            className="button"
            onClick={() => {
              authorizeUser(record._id);
              navigate(`one/${record._id}`);
            }}
          >
            <EyeOutlined /> Switch account
          </Button>
        );
      },
    },
  ];
  if (isError || !hasToken) {
    return (
      <div className="page-404">
        need to login ... 🫠
        <Button onClick={() => location.reload()}>Refresh 🔄</Button>
      </div>
    );
  }
  return (
    <div className="user-list">
      <div className="user-list__header">
        <Select
          className="user-list__select"
          options={userTypes?.docs?.map(
            (type: { _id: string; name: string }) => ({
              value: type._id,
              label: type.name,
            })
          )}
          onChange={(value: any) => {
            const newParams: any = {};
            newParams.userType = value! || "";
            searchValue && (newParams.searchValue = searchValue);
            setSearchParams(newParams);
          }}
          placeholder="Select a user type"
          allowClear
          value={userType}
        />
        <Search
          placeholder="input search text"
          onChange={onSearch}
          value={searchValue!}
        />

        <Paragraph copyable={{ text: "12345678@Aa" }}>
          {"96% of users passwords : 12345678@Aa"}
        </Paragraph>
      </div>
      {isPending ? (
        <Spin />
      ) : (
        <Table
          dataSource={dataSource}
          columns={columns as any}
          pagination={false}
        />
      )}
    </div>
  );
};

export default UsersList;

const getusers = async (params: {
  page: number;
  perPage: number;
  search?: string | null;
  userType?: string | null;
}) => {
  try {
    const data = await axiosInstance.get(`/users`, { params });

    return data.data;
  } catch (error: any) {
    throw error;
  }
};

const autoConect = async (id: string) => {
  try {
    const data = await axiosInstance.post(`/users/auto-connect/${id}`);

    return data.data;
  } catch (error: any) {
    throw error;
  }
};
const getUserTypes = async () => {
  try {
    const data = await axiosInstance.get(`/usertypes`);

    return data.data;
  } catch (error: any) {
    throw error;
  }
};
