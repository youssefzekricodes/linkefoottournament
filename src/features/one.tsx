import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../utils/index.axios";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Spin, message } from "antd";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";

const OnePlayerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");
  const searchValue = searchParams.get("searchValue") || null;
  const userType = searchParams.get("userType") || null;

  const queryClient = new QueryClient();

  const { id } = useParams();
  const navigate = useNavigate();
  const { data: oneUser, isPending } = useQuery({
    queryFn: () => getOneUser(id!),
    queryKey: ["one-user"],
    enabled: !!id,
  });

  const currentUser = oneUser?.data?.user;
  console.log({ usetype: currentUser?.userType });
  const { data: invitations, isPending: isFetching } = useQuery({
    queryFn: () =>
      getUserInvitations(token!, currentUser?.userType?.name === "PLAYER"),
    queryKey: ["one-user-invitations"],
    enabled: !!token && !!currentUser,
  });

  const { mutate: acceptinvitation, isPending: isAccepting } = useMutation({
    mutationFn: (invitationId: string) =>
      acceptInvitation(token!, invitationId!),
    onSuccess: (res) => {
      message.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["one-user-invitations"] });
    },
    onError: (error) => {
      message.error(error?.message!);
    },
  });

  if (isPending && isFetching) return <Spin />;

  return (
    <div className="one-user">
      <div className="one-user__button">
        <Button
          className="button"
          onClick={() => {
            navigate("/");
            const newParams = {};
            userType && (newParams.userType = userType);
            searchValue && (newParams.searchValue = searchValue);
            setSearchParams({ ...newParams });
          }}
        >
          <ArrowLeftOutlined /> Go back
        </Button>
      </div>
      <div className="one-user__image">
        <img src={currentUser?.profilePicUrl} alt="" />
      </div>
      <p className="one-user__name">
        {currentUser?.userName || currentUser?.name}
      </p>
      {!token && <h1>Not authorized !🤪</h1>}
      total invitations : {invitations?.docs?.length} 🥶
      {invitations?.docs?.map((invitation: any) => (
        <div
          className="tournament-card"
          style={{
            backgroundImage: `url(${invitation.tournament.backgroundImage})`,
          }}
        >
          <div className="tournament-card__header">
            <div className="user__avatar">
              <img
                src={invitation.tournament.createdBy.profilePicUrl}
                alt="user"
              />
            </div>
            <p className="tournament-card__tr-name">
              {invitation.tournament.name}
            </p>
          </div>

          <Button
            onClick={() => acceptinvitation(invitation._id)}
            className="button"
            loading={isAccepting}
          >
            Accept
          </Button>
        </div>
      ))}
    </div>
  );
};

export default OnePlayerPage;

const getOneUser = async (id: string) => {
  try {
    const data = await axiosInstance.get(`/users/${id}`);

    return data.data;
  } catch (error: any) {
    throw error;
  }
};

const getUserInvitations = async (token: string, isPlayer: boolean) => {
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  try {
    const data = await axios.get(
      `https://staginglinkfootapi.softylines.com/api/v1/tournament-invitations/${
        isPlayer ? `invitations` : `user`
      }?status=PENDING${isPlayer ? "&participants=true" : ""}`,
      {
        headers,
      }
    );

    return data.data;
  } catch (error: any) {
    throw error;
  }
};

const acceptInvitation = async (token: string, id: string) => {
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  try {
    const data = await axios.patch(
      `https://staginglinkfootapi.softylines.com/api/v1/tournament-invitations/invitations/${id}/status`,
      {
        status: "ACCEPTED",
      },
      {
        headers,
      }
    );

    return data.data;
  } catch (error: any) {
    throw error;
  }
};
