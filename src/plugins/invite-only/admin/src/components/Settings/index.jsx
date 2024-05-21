// copied from https://github.com/AsyncWeb/strapi-chatgpt/blob/main/admin/src/components/Settings/index.jsx
import React, { useState, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { Helmet } from "react-helmet";
import axios from "axios";
import { auth, useNotification } from "@strapi/helper-plugin";
import {
  Layout,
  Button,
  HeaderLayout,
  ContentLayout,
  Grid,
  GridItem,
  Box,
  TextInput,
  Main,
  Select,
  Typography,
  Option,
  Link,
} from "@strapi/design-system";

import { Check, ExternalLinkIcon } from "@strapi/icons";

const Settings = () => {
  const { formatMessage } = useIntl();
  const toggleNotification = useNotification();
  const [loading, setLoading] = useState(false);
  const secretPasscodeRef = useRef("");
//   const modelNameRef = useRef("text-davinci-003");
//   const maxTokensRef = useRef(2048);

  const instance = axios.create({
    baseURL: process.env.STRAPI_ADMIN_BACKEND_URL,
    headers: {
      Authorization: `Bearer ${auth.getToken()}`,
      "Content-Type": "application/json",
    },
  });

  const [secretPasscodeConfig, setSecretPasscodeConfig] = useState({
    secretPasscode: "",
  });

  const setData = (data) => {
    setSecretPasscodeConfig(data);
    // update the refs
    secretPasscodeRef.current = data.secretPasscode;
    // modelNameRef.current = data.modelName;
    // maxTokensRef.current = data.maxTokens;
  };

  const handleSecretPasscodeConfigChange = (key) => (e) => {
    console.log("key", e);
    // update the refs
    if (key === "modelName") {
      setSecretPasscodeConfig({
        ...secretPasscodeConfig,
        [key]: e,
      });
    } else {
      setSecretPasscodeConfig({
        ...secretPasscodeConfig,
        [key]: e.target.value,
      });
    }

    switch (key) {
      case "secretPasscode":
        secretPasscodeRef.current = e.target.value;
        break;
    //   case "modelName":
    //     modelNameRef.current = e;
    //     break;
    //   case "maxTokens":
    //     maxTokensRef.current = e.target.value;
    //     break;
      default:
        break;
    }
  };

  useEffect(() => {
    setLoading(true);
    const fetchChatGPTConfig = async () => {
      try {
        const { data } = await instance.get("/invite-only/config");
        setData(data);
      } catch (error) {
        console.log(error);
        toggleNotification({
          type: "warning",
          message: {
            id: "secret-passcode-fetch-error",
            defaultMessage: "Error while fetching the OpenAI configurations",
          },
        });
      }
    };
    fetchChatGPTConfig();
    setLoading(false);
  }, []);

  const handelSave = async () => {
    const config = {
      secretPasscode: secretPasscodeRef.current,
    //   modelName: modelNameRef.current,
    //   maxTokens: maxTokensRef.current,
    };

    // check if the api key  entered
    if (!config.secretPasscode) {
      toggleNotification({
        type: "warning",
        message: {
          id: "secret-passcode-api-key-required",
          defaultMessage: "Please enter a secret passcode",
        },
      });
      return;
    }
    setLoading(true);

    try {
      const { data } = await instance.post("/invite-only/config/update", {
        ...secretPasscodeConfig,
      });
      if (data && data.value) {
        setData(JSON.parse(data.value));
      }
      setLoading(false);
      toggleNotification({
        type: "success",
        message: {
          id: "secret-passcode-save-success",
          defaultMessage: "Secret passcode saved successfully",
        },
      });
    } catch (error) {
      setLoading(false);
      console.log(error);
      toggleNotification({
        type: "warning",
        message: {
          id: "secret-passcode-save-error",
          defaultMessage: "Error while saving the secret passcode",
        },
      });
    }
  };

  return (
    <Layout>
      <Helmet title={"Strapi OpenAI Configuration"} />
      <Main aria-busy={false}>
        <HeaderLayout
          title={"Secret passcode"}
          subtitle={formatMessage({
            id: "secret-passcode-headder",
            defaultMessage:
              "Configure the secret passcode that anyone can use to register",
          })}
          primaryAction={
            <Button
              startIcon={<Check />}
              onClick={handelSave}
              loading={loading}
            >
              Save
            </Button>
          }
        />

        <ContentLayout>
          <Box
            shadow="tableShadow"
            background="neutral0"
            paddingTop={6}
            paddingLeft={7}
            paddingRight={7}
            paddingBottom={6}
            hasRadius
          >
            <Grid gap={6}>
              <GridItem col={6}>
                <TextInput
                  type="text"
                  id="secretPasscode"
                  name="secretPasscode"
                  placeholder="Whatever secret word"
                  label="Secret passcode"
                  refs={secretPasscodeRef}
                  value={secretPasscodeConfig.secretPasscode}
                  onChange={handleSecretPasscodeConfigChange("secretPasscode")}
                />
              </GridItem>

              {/* <GridItem col={6}>
                <TextInput
                  type="text"
                  id="maxTokens"
                  name="maxTokens"
                  label="Max Tokens"
                  placeholder="2048"
                  refs={maxTokensRef}
                  value={secretPasscodeConfig.maxTokens}
                  onChange={handleSecretPasscodeConfigChange("maxTokens")}
                />
              </GridItem> */}
              {/* <GridItem>
                <Select
                  name="modelName"
                  id="modelName"
                  label="Model Name"
                  placeholder="Select a model"
                  refs={modelNameRef}
                  value={secretPasscodeConfig.modelName}
                  onChange={handleSecretPasscodeConfigChange("modelName")}
                >
                  {AiModels.map((model) => (
                    <Option key={model.value} value={model.value}>
                      {model.value} - {model.label}
                    </Option>
                  ))}
                </Select>
              </GridItem> */}
            </Grid>
          </Box>
        </ContentLayout>
      </Main>
    </Layout>
  );
};

export default Settings;