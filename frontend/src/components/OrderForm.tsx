import React, { useState } from "react";
import {
  Button,
  Form,
  FormProps,
  Input,
  InputNumber,
  Modal,
  Select,
} from "antd";

import { gql, useMutation } from "@apollo/client";
import CreateOrderFulfill from "../graphql/CreateOrderFulfill";

function OrderForm() {
  const initialState = {
    ticker: "",
    action: "",
    quantity: 0,
    limit_price: 0.0,
  };

  const [CreateOrder, { data, loading, error }] =
    useMutation(CreateOrderFulfill);

  const [visibleOrder, setvisibleOrder] = useState(false);
  const [currentForm, setCurrentForm] = useState(0);
  const [orderParams, setOrderParams] = useState(initialState);
  const [orderForm] = Form.useForm();
  const [confForm] = Form.useForm();

  const showModal = () => {
    setvisibleOrder(true);
  };

  const handleCancel = () => {
    setvisibleOrder(false);
    orderForm.resetFields();
    setOrderParams({ ...initialState });
    setCurrentForm(0);
  };

  const onEntryFinish = (values) => {
    setvisibleOrder(false);
    setOrderParams((orderParams) => ({
      ...orderParams,
      ...values,
    }));
    CreateOrder({
      variables: {
        userId: 10,
        stockId: 11,
        quantity: values.quantity,
        limitPrice: values.limit_price,
        typeAsk: values.action == "Buy" ? false : true,
      },
    });
    if (data) {
      console.log("returned data: ", data);
    }
    console.log("order params: ", orderParams);
    console.log(values);

    orderForm.resetFields();
  };

  const onEntryFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <>
      <Button onClick={showModal}>Open Form</Button>
      <Modal
        open={visibleOrder}
        onOk={orderForm.submit}
        onCancel={handleCancel}
      >
        <Form
          form={orderForm}
          id="stockSubmit"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          style={{ maxWidth: 600 }}
          onFinish={onEntryFinish}
          onFinishFailed={onEntryFinishFailed}
        >
          <Form.Item name="ticker" label="Symbol">
            <Input />
          </Form.Item>
          <Form.Item name="action" label="Action">
            <Select>
              <Select.Option value="Buy">Buy</Select.Option>
              <Select.Option value="Sell">Sell</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Quantity">
            <InputNumber />
          </Form.Item>
          <Form.Item name="limit_price" label="Limit Price">
            <InputNumber
              style={{ width: 200 }}
              min={0}
              precision={2}
              step={0.01}
              formatter={(value) => `$ ${value}`}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default OrderForm;
