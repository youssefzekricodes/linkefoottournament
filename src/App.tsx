import { Button, Form, FormProps, Input, Modal, message } from "antd";
import { Suspense, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.scss";
import CreateUser from "./features/create";
import OnePlayerPage from "./features/one";
import UsersList from "./features/users";
import { axiosInstance } from "./utils/index.axios";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <UsersList />,
    },
    {
      path: "create",
      element: <CreateUser />,
    },
    {
      path: "one/:id",
      element: <OnePlayerPage />,
    },
  ]);

  const onFinish: FormProps<any>["onFinish"] = async (values) => {
    console.log("Success:", values);
    try {
      const res = await axiosInstance.post("/auth/admins/login", values);
      message.success("Login Success");
      setIsModalOpen(false);
      localStorage.setItem("token", res?.data?.data?.tokens?.accessToken);
    } catch (err) {
      message.error("Login Failed");
    }
  };

  return (
    <div className="app">
      <Modal
        title="Login"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ email: "super@super.com", password: "super123" }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<any>
            label="Username"
            name="email"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<any>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Suspense>
        <Button type="primary" onClick={showModal}>
          Login
        </Button>
        <RouterProvider router={router} />
      </Suspense>
    </div>
  );
}

export default App;
