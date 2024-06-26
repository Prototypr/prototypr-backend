import { prefixPluginTranslations } from "@strapi/helper-plugin";
import pluginPkg from "../../package.json";
import pluginId from "./pluginId";
import Initializer from "./components/Initializer";
import PluginIcon from "./components/PluginIcon";

const name = pluginPkg.strapi.name;
const displayName = pluginPkg.strapi.displayName;

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: displayName,
      },
      Component: async () => {
        const component = await import(
          /* webpackChunkName: "[request]" */ "./pages/App"
        );

        return component;
      },
      permissions: [
        // Uncomment to set the permissions of the plugin here
        // {
        //   action: '', // the action name should be plugin::plugin-name.actionType
        //   subject: null,
        // },
      ],
    });

    // Prototypr addition - add to admin settings
    app.createSettingSection(
      {
        id: pluginId,
        intlLabel: {
          id: `${pluginId}.plugin.name`,
          defaultMessage: "Invite Only",
        },
      },
      [
        {
          intlLabel: {
            id: `${pluginId}.plugin.name`,
            defaultMessage: "Manage Invites",
          },
          id: "invite-only-settings",
          to: `/settings/${pluginId}/manage-invites`,
          Component: async () => {
            const component = await import(
              /* webpackChunkName: "[request]" */ "./pages/HomePage"
            );
            return component;
          },
          permissions: [
            // Uncomment to set the permissions of the plugin here
            // {
            //   action: '', // the action name should be plugin::plugin-name.actionType
            //   subject: null,
            // },
          ],
        },

        {
          intlLabel: {
            id: `${pluginId}.plugin.name`,
            defaultMessage: "Secret Passcode",
          },
          id: `${pluginId}-passcode`,
          to: `/settings/${pluginId}/secret-passcode`,
          // permissions: pluginPermissions.settingsRoles,
          Component: async () => {
            const component = await import(
              /* webpackChunkName: "stripe-page" */
              "./pages/Settings"
            );

            return component;
          },
        },
      ]
    );

    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
  },

  bootstrap(app) {},
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(
          /* webpackChunkName: "translation-[request]" */ `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
