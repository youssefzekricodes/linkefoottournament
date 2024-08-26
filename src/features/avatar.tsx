import React, { useState } from "react";
import defaultavatar from "../assets/default.png";
const AvatarDefault = ({ profilePicUrl }: any) => {
  const [error, setError] = useState(false);
  return (
    <div className="user__avatar">
      <img
        src={error ? defaultavatar : profilePicUrl}
        alt="user"
        onError={() => setError(true)}
      />
    </div>
  );
};

export default AvatarDefault;
