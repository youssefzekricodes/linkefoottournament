import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Select, Spin, Table, Tag } from "antd";
import React, { useState } from "react";
import { axiosInstance } from "../utils/index.axios";
import Paragraph from "antd/es/typography/Paragraph";
import Search from "antd/es/transfer/search";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";

const UsersList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchValue = searchParams.get("searchValue") || null;
  const userType = searchParams.get("userType") || null;

  const { data: users, isPending } = useQuery({
    queryFn: () =>
      getusers({
        page: 1,
        perPage: 200,
        userType,
        search: searchValue!,
      }),
    queryKey: ["users-list", { searchValue, userType }],
  });
  const { data: userTypes, isPending: isFetchingUserTypes } = useQuery({
    queryFn: () => getUserTypes(),
    queryKey: ["users-types"],
  });

  const { mutate: authorizeUser } = useMutation({
    mutationFn: (id: string) => autoConect(id),
    onSuccess: (res) => {
      const token = res.data.tokens.accessToken;
      const newParams = {};
      userType && (newParams.userType = userType);
      searchValue && (newParams.searchValue = searchValue);
      setSearchParams({ ...newParams, token });
    },
  });
  const dataSource = users?.docs;

  const onSearch = (e: any) => {
    const newParams = { searchValue: e.target.value! };
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
        return (
          <div className="user">
            <div className="user__avatar">
              <img src={record?.profilePicUrl} alt="user" />
            </div>
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
      render: (_, record) => {
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
            const newParams = {};
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
          style={{ width: 100 }}
          value={searchValue}
        />

        <Paragraph copyable={{ text: "12345678@Aa" }}>
          {"96% of users passwords : 12345678@Aa"}
        </Paragraph>
      </div>
      {isPending ? (
        <Spin />
      ) : (
        <Table dataSource={dataSource} columns={columns} pagination={false} />
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
