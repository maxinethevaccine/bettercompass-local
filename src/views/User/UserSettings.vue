<template>
  <div>
    <v-dialog v-model="createTheme" max-width="950px">
      <v-card color="card">
        <v-toolbar color="toolbar">
          <v-toolbar-title>
            Theme {{ creatorType === "create" ? "Creator" : "Editor" }}
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <span v-on="on" v-bind="attrs">
                  <v-btn fab small text @click="randomizeTheme">
                    <v-icon>mdi-dice-multiple</v-icon>
                  </v-btn>
                </span>
              </template>
              <span> Randomize theme </span>
            </v-tooltip>
          </v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-form>
            <v-text-field
              v-model="creator.name"
              class="mx-3"
              label="Theme Name"
              required
            ></v-text-field>
            <v-select
              :items="intendedFor"
              label="Intended for"
              class="mx-3"
              v-model="creator.primaryType"
            >
            </v-select>
            <v-text-field
              v-model="creatorJSON"
              label="JSON"
              class="mx-3"
            ></v-text-field>
            <h2
              class="ml-2 mt-2 mb-3"
              v-if="
                creator.primaryType === 'dark' || creator.primaryType === 'all'
              "
            >
              Dark:
            </h2>
            <v-row
              v-if="
                creator.primaryType === 'dark' || creator.primaryType === 'all'
              "
            >
              <v-col
                sm="3"
                v-for="(item, index) in creator.dark"
                :key="index + '-dark-card'"
              >
                <v-card color="card">
                  <h3 class="ml-2 mt-2 mb-2">
                    {{ friendlyName(index) }}
                  </h3>
                  <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                      <v-card
                        class="mb-2 mx-2"
                        :color="creator.dark[index]"
                        v-on="on"
                      >
                        <v-container></v-container>
                      </v-card>
                    </template>
                    <v-color-picker
                      v-model="creator.dark[index]"
                      show-swatches
                      hide-inputs
                    ></v-color-picker>
                  </v-menu>
                  <v-text-field
                    class="mx-2"
                    label="#HEX"
                    v-model="creator.dark[index]"
                  ></v-text-field>
                </v-card>
              </v-col>
            </v-row>
            <h2
              class="ml-2 mt-2 mb-3"
              v-if="
                creator.primaryType === 'light' || creator.primaryType === 'all'
              "
            >
              Light:
            </h2>
            <v-row
              v-if="
                creator.primaryType === 'light' || creator.primaryType === 'all'
              "
            >
              <v-col
                sm="3"
                v-for="(item, index) in creator.light"
                :key="index + '-light-card'"
              >
                <v-card color="card">
                  <h3 class="ml-2 mt-2 mb-2">
                    {{ friendlyName(index) }}
                  </h3>
                  <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                      <v-card
                        class="mb-2 mx-2"
                        :color="creator.light[index]"
                        v-on="on"
                      >
                        <v-container></v-container>
                      </v-card>
                    </template>
                    <v-color-picker
                      v-model="creator.light[index]"
                      show-swatches
                      hide-inputs
                    ></v-color-picker>
                  </v-menu>
                  <v-text-field
                    class="mx-2"
                    label="#HEX"
                    v-model="creator.light[index]"
                  ></v-text-field>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
          <v-card-actions>
            <v-btn color="primary" text @click="doCreateTheme">{{
              creatorType === "create" ? "Create & Apply" : "Save Edits"
            }}</v-btn>
            <v-btn
              color="primary"
              text
              @click="doCreateTheme('copy')"
              v-if="creatorType === 'edit'"
              >Save a Copy</v-btn
            >
            <v-btn color="error darken-1" text @click="doDiscardTheme"
              >Discard</v-btn
            >
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
    <v-dialog v-model="createAccountDialog" max-width="950px">
      <v-card color="card">
        <v-card-title>
          <span class="headline">Create Account</span>
        </v-card-title>
        <v-card-text v-if="alternateCreationType">
          <p>
            This will create a BetterCompass account, you will be automatically
            logged in with it when logging into BetterCompass in addition to
            your normal Compass account.
          </p>
          <p>Information:</p>
          <ul>
            <li>
              When creating an account, a database object with your Compass
              username ({{ $store.state.user.username }}), ID ({{
                $store.state.user.userId
              }}), and Compass instance ({{ $store.state.school.instance }})
              will be created, along with your chosen settings.
            </li>
            <li>
              When logging in you'll be given a special BetterCompass
              authentication token which will grant you access to both
              BetterCompass Accounts, and Compass.
            </li>
            <li>
              Your original Compass session will never be sent to the client,
              instead mapped to the BetterCompass authentication token on the
              server.
            </li>
            <li>
              You'll have the ability to check recent logins, and invalidate
              BetterCompass sessions at your will.
            </li>
            <li>
              You'll also have the ability to set a custom token expiry time for
              security.
            </li>
            <li>
              You may delete your account at any time, which will delete all
              your data from the BetterCompass server, and you'll still be able
              to use BetterCompass with the original Compass-only authentication
              method.
            </li>
            <li>Your password will not be stored on the server.</li>
            <li>
              This authentication method will have many extended features and
              benefits in the future.
            </li>
          </ul>
          <v-checkbox v-model="agree">
            <template slot="label">
              I agree with the above information, and the&nbsp;<router-link
                to="/privacy"
                style="text-decoration: none"
              >
                privacy policy</router-link
              >.
            </template>
          </v-checkbox>
        </v-card-text>
        <v-card-text v-else>
          <p>This will create a BetterCompass account.</p>
          <p>Information:</p>
          <ul>
            <li>
              When creating an account, a database object with your Compass
              username ({{ $store.state.user.username }}), ID ({{
                $store.state.user.userId
              }}), and Compass instance ({{ $store.state.school.instance }})
              will be created, along with your chosen settings.
            </li>
            <li>
              When a request is made to a route that uses BetterCompass
              Accounts, it will authenticate with Compass using your session to
              validate authenticity on the server.
            </li>
            <li>
              Your session, and sensitive information will not be stored on the
              server.
            </li>
          </ul>
          <v-checkbox
            v-model="agree"
            label="I agree with the above information."
          >
          </v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="createAccountDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="!agree"
            @click="createAccount"
          >
            Create Account
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card color="card" class="rounded-xl" elevation="7">
      <v-toolbar color="toolbar">
        <v-toolbar-title>BetterCompass Settings</v-toolbar-title> </v-toolbar
      ><br />
      <v-alert type="info" class="mx-6" text>
        Your settings (including themes) are saved in this browser only.
      </v-alert>
      <v-card-title>Website Settings</v-card-title>
      <v-card-text>
        <v-text-field
          :value="$store.state.user.bcUser.discussionsImage"
          label="Avatar URL (set via Customization below)"
          disabled
        ></v-text-field>
      </v-card-text>
      <v-card-title>Customization</v-card-title>
      <v-card-text>
        <h3 class="mb-2">School profile picture</h3>
        <p class="mb-2">
          This is your real Compass photo, shown on your Account dashboard.
          It can't be replaced, only resized.
        </p>
        <v-slider
          v-model="$store.state.user.bcUser.schoolPhotoSize"
          @change="saveSettings"
          min="80"
          max="200"
          thumb-label
          label="Size"
        ></v-slider>
      </v-card-text>
      <v-card-text>
        <h3 class="mb-2">Profile picture</h3>
        <p class="mb-2">
          Your own custom avatar, shown around BetterCompass (header,
          discussions, etc.) instead of your school photo.
        </p>
        <div class="d-flex align-center flex-wrap" style="gap: 16px">
          <v-avatar size="64" color="toolbar">
            <v-icon v-if="!$store.state.user.bcUser.discussionsImage" x-large>
              mdi-account-circle
            </v-icon>
            <img
              v-else
              :src="$store.state.user.bcUser.discussionsImage"
              alt="Your avatar"
            />
          </v-avatar>
          <v-btn
            class="rounded-xl"
            :loading="avatarUploading"
            @click="$refs.avatarFile.click()"
          >
            <v-icon left>mdi-upload</v-icon>
            Upload a photo
          </v-btn>
          <v-btn
            v-if="$store.state.user.bcUser.discussionsImage"
            text
            class="rounded-xl"
            @click="removeAvatar"
          >
            Remove
          </v-btn>
        </div>
        <input
          ref="avatarFile"
          type="file"
          accept="image/*"
          style="display: none"
          @change="onAvatarFileChange"
        />
        <v-alert v-if="avatarError" type="error" text dense class="mt-2">
          {{ avatarError }}
        </v-alert>
        <small>Only visible to you, and stored on this device.</small>
      </v-card-text>
      <v-card-text>
        <h3 class="mb-2">Background image</h3>
        <div
          v-if="$store.state.user.bcUser.customBackground"
          class="rounded-xl mb-3"
          :style="{
            height: '100px',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage:
              'url(' + $store.state.user.bcUser.customBackground + ')'
          }"
        ></div>
        <v-btn
          class="rounded-xl mr-2"
          :loading="backgroundUploading"
          @click="$refs.backgroundFile.click()"
        >
          <v-icon left>mdi-upload</v-icon>
          Upload a background
        </v-btn>
        <v-btn
          v-if="$store.state.user.bcUser.customBackground"
          text
          class="rounded-xl"
          @click="removeBackground"
        >
          Remove
        </v-btn>
        <input
          ref="backgroundFile"
          type="file"
          accept="image/*"
          style="display: none"
          @change="onBackgroundFileChange"
        />
        <v-alert v-if="backgroundError" type="error" text dense class="mt-2">
          {{ backgroundError }}
        </v-alert>
        <template v-if="$store.state.user.bcUser.customBackground">
          <p class="mt-4 mb-0">Dim</p>
          <v-slider
            v-model="$store.state.user.bcUser.customBackgroundDim"
            @change="saveSettings"
            min="0"
            max="90"
            thumb-label
          ></v-slider>
          <p class="mb-0">Blur</p>
          <v-slider
            v-model="$store.state.user.bcUser.customBackgroundBlur"
            @change="saveSettings"
            min="0"
            max="20"
            thumb-label
          ></v-slider>
          <v-switch
            id="bcx-bg-full-switch"
            v-model="$store.state.user.bcUser.customBackgroundFull"
            @change="saveSettings"
            inset
            hide-details
            class="mt-0 mb-3"
            label="Show the background behind everything"
          ></v-switch>
          <small class="d-block mb-3">
            Cards, the sidebar and the top bar lose their colour, so the
            picture fills the whole page and the text sits on top of it. If
            text gets hard to read, turn Dim or Blur up.
          </small>
        <template v-if="!$store.state.user.bcUser.customBackgroundFull">
        <p class="mt-2 mb-0">
          Background see-through:
          {{ $store.state.user.bcUser.customBackgroundOpacity ?? 25 }}%
        </p>
        <v-slider
          v-model="$store.state.user.bcUser.customBackgroundOpacity"
          @change="saveSettings"
          min="0"
          max="50"
          thumb-label
          hide-details
          label="See-through"
        ></v-slider>
        </template>
        </template>
        <small>Only visible to you, and stored on this device.</small>
      </v-card-text>
      <v-card-text id="bcx-font-settings">
        <h3 class="mb-2">Fonts</h3>
        <p class="mb-3">
          Pick a font for the whole app, then give any part its own font if
          you want. Parts set to "Same as Everything" follow the main font.
        </p>
        <v-row dense>
          <v-col cols="12" md="6" v-for="area in fontAreas" :key="area.key">
            <v-select
              :label="area.name"
              :items="fontItems(area)"
              item-text="name"
              item-value="value"
              :value="fonts[area.key]"
              @change="setFont(area.key, $event)"
              outlined
              dense
              hide-details
              class="mb-2"
            >
              <template v-slot:item="{ item }">
                <span :style="{ fontFamily: item.value || 'Roboto, sans-serif' }">
                  {{ item.name }}
                </span>
              </template>
            </v-select>
          </v-col>
        </v-row>
        <p class="mt-4 mb-0">Text size: {{ fonts.scale }}%</p>
        <v-slider
          :value="fonts.scale"
          @change="setFont('scale', $event)"
          min="75"
          max="140"
          step="5"
          thumb-label
          hide-details
        ></v-slider>
        <h4 class="mt-4 mb-2">Use a font that is not in the list</h4>
        <v-row dense align="center">
          <v-col cols="12" md="7">
            <v-text-field
              v-model="customFontName"
              label="Name of a font installed on this computer"
              placeholder="e.g. Futura"
              outlined
              dense
              hide-details
              @keyup.enter="addCustomFont"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="5">
            <v-btn class="rounded-xl" @click="addCustomFont">
              <v-icon left>mdi-plus</v-icon>
              Add to the list
            </v-btn>
          </v-col>
        </v-row>
        <div class="mt-2" v-if="fonts.custom.length">
          <v-chip
            v-for="name in fonts.custom"
            :key="name"
            close
            class="mr-2 mb-2"
            @click:close="removeCustomFont(name)"
            >{{ name }}</v-chip
          >
        </div>
        <div class="mt-3">
          <v-btn
            class="rounded-xl mr-2"
            :loading="fontUploading"
            @click="$refs.fontFile.click()"
          >
            <v-icon left>mdi-upload</v-icon>
            Upload a font file
          </v-btn>
          <v-btn
            v-if="fonts.uploaded"
            text
            class="rounded-xl mr-2"
            @click="removeUploadedFont"
          >
            Remove "{{ fonts.uploaded.name }}"
          </v-btn>
          <v-btn text class="rounded-xl" @click="resetFonts">
            Reset all fonts
          </v-btn>
          <input
            ref="fontFile"
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            style="display: none"
            @change="onFontFileChange"
          />
        </div>
        <v-alert v-if="fontError" type="error" text dense class="mt-2">
          {{ fontError }}
        </v-alert>
        <small class="d-block mt-2"
          >Font files (.ttf, .otf, .woff, .woff2, up to 1 MB) are stored on
          this device only. Icons always keep their own font.</small
        >
      </v-card-text>
      <v-card-text>
        <v-switch
          @change="saveSettings"
          v-model="$store.state.user.bcUser.learningTaskNotification"
          inset
          label="Show overdue learning task warning"
          color="warning"
        ></v-switch>
      </v-card-text>
      <v-card-text v-if="debugModeEnabled">
        <v-alert type="error" text> Seizure warning. </v-alert>
        <v-slider v-model="slider" hint="Speed" max="2000" min="10"></v-slider>
        <v-btn class="mr-2" @click="randomColorTheme()"> Set </v-btn>
        <v-btn @click="stopColorTheme()"> Stop </v-btn>
      </v-card-text>
      <v-card-text>
        <p>
          Minimize header events has been replaced.<br />You can now disable
          individual calendars via Calendar Settings on the homepage.
        </p>
      </v-card-text>
      <v-card-text v-if="this.$store.state.site.release === 'dev'">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <div v-on="on" v-bind="attrs">
              <v-switch
                @change="saveSettings"
                v-model="$store.state.user.bcUser.cache"
                inset
                label="Offline caching"
              ></v-switch>
            </div>
          </template>
          <span>
            This will cache your calendar events, and user information for
            offline usage that is relevant for 2 weeks. (This may pose a
            privacy/security risk, as it is stored in your browser's local
            storage.)
          </span>
        </v-tooltip>
      </v-card-text>
      <v-card-text>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <div v-on="on" v-bind="attrs">
              <v-switch
                @change="saveSettings"
                v-model="$store.state.user.bcUser.calendarAutoJump"
                inset
                label="Calendar Auto Jump"
              ></v-switch>
            </div>
          </template>
          <span> This will skip to Monday on Saturday and Sunday. </span>
        </v-tooltip>
      </v-card-text>
      <v-card-title>Theming and Personalization</v-card-title>
      <v-card-text>
        <v-switch
          v-model="$store.state.user.bcUser.theme"
          true-value="dark"
          false-value="light"
          @change="saveSettings"
          inset
          label="Dark theme"
        ></v-switch>
      </v-card-text>
      <v-alert
        v-if="
          ($vuetify.theme.themes.primaryType === 'light' &&
            $vuetify.theme.dark) ||
          ($vuetify.theme.themes.primaryType === 'dark' && !$vuetify.theme.dark)
        "
        class="mx-6"
        outlined
        type="warning"
      >
        You currently have a theme enabled that is not designed for your
        selected base theme.
      </v-alert>
      <v-card-text
        ><v-switch
          inset
          v-model="defineAccent"
          label="Use a custom accent color (overrides theme's primary attribute)."
        ></v-switch>
        <v-color-picker
          v-if="defineAccent"
          hide-canvas
          value="hex"
          hide-inputs
          show-swatches
          swatches-max-height="132"
          v-model="accent"
        ></v-color-picker>
      </v-card-text>
      <v-card-text>
        <v-card
          class="my-2"
          @click="setTheme(theme)"
          hover
          outlined
          v-for="(theme, index) in computeThemes"
          :key="index"
          color="card"
        >
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="font-weight-bold">
                {{ theme.name }}
                <v-btn text fab small @click="download(theme)">
                  <v-icon>mdi-download</v-icon>
                </v-btn>
                <v-btn
                  text
                  fab
                  small
                  @click="initEditTheme(theme)"
                  v-if="theme.userId === $store.state.user.bcUser.id"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  text
                  fab
                  small
                  @click="doDeleteTheme(theme)"
                  v-if="theme.userId === $store.state.user.bcUser.id"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn text fab small @click="doCreateTheme('copy', theme)">
                  <v-icon>mdi-content-copy</v-icon>
                </v-btn>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ theme.public ? "Public" : "Private" }}, created by
                {{ theme.user.sussiId }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-avatar color="success" size="30" v-if="name === theme.id">
                <v-icon>mdi-check</v-icon>
              </v-avatar>
            </v-list-item-action>
          </v-list-item>
          <div class="my-2" v-if="$vuetify.theme.dark">
            <v-chip-group>
              <v-chip
                class="mx-1"
                label
                :color="theme.dark[key]"
                v-for="(key, index) in Object.keys(theme.dark)"
                :key="index"
              >
                {{ friendlyName(key) }}</v-chip
              >
            </v-chip-group>
          </div>
          <div class="my-2" v-if="!$vuetify.theme.dark">
            <v-chip-group column>
              <v-chip
                class="mx-1"
                label
                :color="theme.light[key]"
                v-for="(key, index) in Object.keys(theme.light)"
                :key="index"
              >
                {{ key }}</v-chip
              >
            </v-chip-group>
          </div>
        </v-card>
        <v-container class="text-center justify-center">
          <v-chip @click="initThemeCreator" x-large outlined fab
            ><v-icon x-large>mdi-plus</v-icon></v-chip
          >
        </v-container>
      </v-card-text>
      <div class="mx-6">
        <small
          >BetterCompass version {{ $store.state.versioning.version }}, built on
          {{ $store.state.versioning.date }}</small
        >
      </div>
    </v-card>
  </div>
</template>

<script>
import AjaxErrorHandler from "@/lib/errorHandler"
import { fileToResizedDataUrl } from "@/lib/imageUpload"
import {
  FONT_AREAS,
  defaultFonts,
  fontChoices,
  cleanFontName,
  customFontValue,
  uploadedFontValue,
  readFontFile
} from "@/lib/fonts"

export default {
  name: "Settings",
  data() {
    return {
      intendedFor: [
        { text: "All base themes", value: "all" },
        { text: "Dark theme", value: "dark" },
        { text: "Light theme", value: "light" }
      ],
      avatarUploading: false,
      avatarError: "",
      backgroundUploading: false,
      backgroundError: "",
      fontAreas: FONT_AREAS,
      customFontName: "",
      fontUploading: false,
      fontError: "",
      defineAccent: false,
      alternateCreationType: false,
      createAccountDialog: false,
      slider: 300,
      agree: false,
      loading: false,
      accent: null,
      creator: {
        id: 1,
        name: "",
        json: {},
        primaryType: "all",
        dark: {
          primary: "#0190ea",
          secondary: "#757575",
          accent: "#000000",
          error: "#ff1744",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#ff9800",
          card: "#151515",
          toolbar: "#191919",
          sheet: "#181818",
          text: "#000000",
          dark: "#151515",
          bg: "#151515",
          calendarNormalActivity: "#dce6f4",
          calendarActivityType7: "#f4dcdc",
          calendarActivityType8: "#4caf50",
          calendarActivityType10: "#ff9800",
          calendarExternalActivity: "#2196f3",
          calendarEventActivity: "#ccffcc"
        },
        light: {
          primary: "#0190ea",
          secondary: "#757575",
          accent: "#000000",
          error: "#ff1744",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#ff9800",
          card: "#f8f8f8",
          toolbar: "#f8f8f8",
          sheet: "#f8f8f8",
          text: "#000000",
          dark: "#f8f8f8",
          bg: "#f8f8f8",
          calendarNormalActivity: "#dce6f4",
          calendarActivityType7: "#f4dcdc",
          calendarActivityType8: "#4caf50",
          calendarActivityType10: "#ff9800",
          calendarExternalActivity: "#2196f3",
          calendarEventActivity: "#ccffcc"
        }
      },
      createTheme: false,
      name: "",
      creatorType: "create",
      themes: [],
      interval: null
    }
  },
  computed: {
    fonts() {
      // Older saved settings have no font choices yet.
      return {
        ...defaultFonts(),
        ...(this.$store.state.user.bcUser?.fonts || {})
      }
    },
    creatorJSON: {
      get() {
        return JSON.stringify(this.creator)
      },
      set(value) {
        this.creator = JSON.parse(value)
      }
    },
    debugModeEnabled() {
      if (localStorage.getItem("debugModeEnabled")) {
        return JSON.parse(localStorage.getItem("debugModeEnabled"))
      } else {
        return false
      }
    },
    computeThemes() {
      let array = []
      if (this.$vuetify.theme.dark) {
        array = this.themes.filter(
          (theme) => theme.primaryType === "dark" || theme.primaryType === "all"
        )
        return array
      } else {
        array = this.themes.filter(
          (theme) =>
            theme.primaryType === "light" || theme.primaryType === "all"
        )
        return array
      }
    }
  },
  methods: {
    /*determineColor(color) {
      const hexCode = color.charAt(0) === "#" ? color.substr(1, 6) : color
      const hexR = parseInt(hexCode.substr(0, 2), 16)
      const hexG = parseInt(hexCode.substr(2, 2), 16)
      const hexB = parseInt(hexCode.substr(4, 2), 16)
      const contrastRatio = (hexR + hexG + hexB) / (255 * 3)
      return contrastRatio >= 0.7 ? "black" : "white"
    },*/
    friendlyName(index) {
      if (index === "calendarNormalActivity") {
        return "Standard Class"
      } else if (index === "calendarActivityType7") {
        return "Substitute Teacher"
      } else if (index === "calendarActivityType8") {
        return "Generic Type 8"
      } else if (index === "calendarActivityType10") {
        return "Learning Task"
      } else if (index === "calendarExternalActivity") {
        return "External Activity"
      } else if (index === "calendarEventActivity") {
        return "Event"
      } else if (index === "bg") {
        return "Background"
      } else if (index === "dark") {
        return "Sidebar & Header"
      } else {
        return index.charAt(0).toUpperCase() + index.slice(1)
      }
    },
    stopColorTheme() {
      clearInterval(this.interval)
    },
    randomColorTheme() {
      clearInterval(this.interval)
      this.interval = setInterval(() => {
        this.$vuetify.theme.themes.light = {
          primary: "#" + Math.floor(Math.random() * 16777215).toString(16),
          secondary: "#" + Math.floor(Math.random() * 16777215).toString(16),
          accent: "#" + Math.floor(Math.random() * 16777215).toString(16),
          error: "#" + Math.floor(Math.random() * 16777215).toString(16),
          info: "#" + Math.floor(Math.random() * 16777215).toString(16),
          success: "#" + Math.floor(Math.random() * 16777215).toString(16),
          warning: "#" + Math.floor(Math.random() * 16777215).toString(16),
          card: "#" + Math.floor(Math.random() * 16777215).toString(16),
          toolbar: "#" + Math.floor(Math.random() * 16777215).toString(16),
          sheet: "#" + Math.floor(Math.random() * 16777215).toString(16),
          text: "#" + Math.floor(Math.random() * 16777215).toString(16),
          dark: "#" + Math.floor(Math.random() * 16777215).toString(16),
          bg: "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarNormalActivity:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType7:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType8:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType10:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarExternalActivity: Math.floor(
            Math.random() * 16777215
          ).toString(16),
          calendarEventActivity:
            "#" + Math.floor(Math.random() * 16777215).toString(16)
        }
        this.$vuetify.theme.themes.dark = {
          primary: "#" + Math.floor(Math.random() * 16777215).toString(16),
          secondary: "#" + Math.floor(Math.random() * 16777215).toString(16),
          accent: "#" + Math.floor(Math.random() * 16777215).toString(16),
          error: "#" + Math.floor(Math.random() * 16777215).toString(16),
          info: "#" + Math.floor(Math.random() * 16777215).toString(16),
          success: "#" + Math.floor(Math.random() * 16777215).toString(16),
          warning: "#" + Math.floor(Math.random() * 16777215).toString(16),
          card: "#" + Math.floor(Math.random() * 16777215).toString(16),
          toolbar: "#" + Math.floor(Math.random() * 16777215).toString(16),
          sheet: "#" + Math.floor(Math.random() * 16777215).toString(16),
          text: "#" + Math.floor(Math.random() * 16777215).toString(16),
          dark: "#" + Math.floor(Math.random() * 16777215).toString(16),
          bg: "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarNormalActivity:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType7:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType8:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarActivityType10:
            "#" + Math.floor(Math.random() * 16777215).toString(16),
          calendarExternalActivity: Math.floor(
            Math.random() * 16777215
          ).toString(16),
          calendarEventActivity:
            "#" + Math.floor(Math.random() * 16777215).toString(16)
        }
      }, this.slider)
    },
    randomizeTheme() {
      this.creator.light = {
        primary: "#" + Math.floor(Math.random() * 16777215).toString(16),
        secondary: "#" + Math.floor(Math.random() * 16777215).toString(16),
        accent: "#" + Math.floor(Math.random() * 16777215).toString(16),
        error: "#" + Math.floor(Math.random() * 16777215).toString(16),
        info: "#" + Math.floor(Math.random() * 16777215).toString(16),
        success: "#" + Math.floor(Math.random() * 16777215).toString(16),
        warning: "#" + Math.floor(Math.random() * 16777215).toString(16),
        card: "#" + Math.floor(Math.random() * 16777215).toString(16),
        toolbar: "#" + Math.floor(Math.random() * 16777215).toString(16),
        sheet: "#" + Math.floor(Math.random() * 16777215).toString(16),
        text: "#" + Math.floor(Math.random() * 16777215).toString(16),
        dark: "#" + Math.floor(Math.random() * 16777215).toString(16),
        bg: "#" + Math.floor(Math.random() * 16777215).toString(16),
        calendarNormalActivity:
          "#" + Math.floor(Math.random() * 16777215).toString(16),
        calendarActivityType7:
          "#" + Math.floor(Math.random() * 16777215).toString(16),
        calendarActivityType8:
          "#" + Math.floor(Math.random() * 16777215).toString(16),
        calendarActivityType10:
          "#" + Math.floor(Math.random() * 16777215).toString(16),
        calendarExternalActivity: Math.floor(Math.random() * 16777215).toString(
          16
        ),
        calendarEventActivity:
          "#" + Math.floor(Math.random() * 16777215).toString(16)
      }
      this.creator.dark = {
        primary: "#" + Math.floor(Math.random() * 16777215).toString(16),
        secondary: "#" + Math.floor(Math.random() * 16777215).toString(16),
        accent: "#" + Math.floor(Math.random() * 16777215).toString(16),
        error: "#" + Math.floor(Math.random() * 16777215).toString(16),
        info: "#" + Math.floor(Math.random() * 16777215).toString(16),
        success: "#" + Math.floor(Math.random() * 16777215).toString(16),
        warning: "#" + Math.floor(Math.random() * 16777215).toString(16),
        card: "#" + Math.floor(Math.random() * 16777215).toString(16),
        toolbar: "#" + Math.floor(Math.random() * 16777215).toString(16),
        sheet: "#" + Math.floor(Math.random() * 16777215).toString(16),
        text: "#" + Math.floor(Math.random() * 16777215).toString(16),
        dark: "#" + Math.floor(Math.random() * 16777215).toString(16),
        bg: "#" + Math.floor(Math.random() * 16777215).toString(16),
        calendarNormalActivity:
          "#" + Math.floor(Math.random() * 16777215).toString(16),
        calendarActivityType7:
          "#" + Math.floor(Math.random() * 16777215).toString(16),
        calendarActivityType8:
          "#" + Math.floor(Math.random() * 16777215).toString(16),
        calendarActivityType10:
          "#" + Math.floor(Math.random() * 16777215).toString(16),
        calendarExternalActivity: Math.floor(Math.random() * 16777215).toString(
          16
        ),
        calendarEventActivity:
          "#" + Math.floor(Math.random() * 16777215).toString(16)
      }
    },
    doDeleteTheme(theme) {
      this.axios
        .delete("/api/v1/themes/" + theme.id)
        .then(() => {
          this.$store.dispatch("getUserInfo")
          this.getThemes()
        })
        .catch((e) => {
          AjaxErrorHandler(e)
        })
    },
    getThemes() {
      this.axios.get("/api/v1/themes").then((res) => {
        this.themes = res.data.map((theme) => {
          return {
            id: theme.id,
            name: theme.name,
            primaryType: theme.theme.primaryType,
            dark: theme.theme.dark,
            light: theme.theme.light,
            public: theme.public,
            user: theme.user,
            userId: theme.userId
          }
        })
      })
    },
    doCreateTheme(type, theme) {
      if (this.creatorType === "create" || type === "copy") {
        this.axios
          .post("/api/v1/themes", {
            name:
              type === "copy"
                ? theme?.name + " - Copy" || this.creator.name + " - Copy"
                : this.creator.name,
            theme: theme || this.creator
          })
          .then(() => {
            this.getThemes()
            this.createTheme = false
          })
          .catch((e) => {
            AjaxErrorHandler(this.$store)(e)
          })
      } else {
        this.axios
          .put("/api/v1/themes/" + this.creator.id, {
            name: this.creator.name,
            theme: this.creator
          })
          .then(() => {
            this.getThemes()
            this.createTheme = false
          })
          .catch((e) => {
            AjaxErrorHandler(this.$store)(e)
          })
      }
    },
    initEditTheme(theme) {
      this.creator = theme
      this.creatorType = "edit"
      this.createTheme = true
    },
    doDiscardTheme() {
      this.creator = {
        id: 1,
        name: "BetterCompass Classic",
        primaryType: "all",
        dark: {
          primary: "#0190ea",
          secondary: "#757575",
          accent: "#000000",
          error: "#ff1744",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#ff9800",
          card: "#151515",
          toolbar: "#191919",
          sheet: "#181818",
          text: "#000000",
          dark: "#151515",
          bg: "#151515",
          calendarNormalActivity: "#dce6f4",
          calendarActivityType7: "#f4dcdc",
          calendarActivityType8: "#4caf50",
          calendarActivityType10: "#ff9800",
          calendarExternalActivity: "#2196f3",
          calendarEventActivity: "#ccffcc"
        },
        light: {
          primary: "#0190ea",
          secondary: "#757575",
          accent: "#000000",
          error: "#ff1744",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#ff9800",
          card: "#f8f8f8",
          toolbar: "#f8f8f8",
          sheet: "#f8f8f8",
          text: "#000000",
          dark: "#f8f8f8",
          bg: "#f8f8f8",
          calendarNormalActivity: "#dce6f4",
          calendarActivityType7: "#f4dcdc",
          calendarActivityType8: "#4caf50",
          calendarActivityType10: "#ff9800",
          calendarExternalActivity: "#2196f3",
          calendarEventActivity: "#ccffcc"
        }
      }
      this.creatorType = "create"
      this.createTheme = false
    },
    initThemeCreator() {
      this.doDiscardTheme()
      this.creatorType = "create"
      this.createTheme = true
    },
    download(theme) {
      const data = JSON.stringify(theme)
      const blob = new Blob([data], { type: "text/plain" })
      const e = document.createEvent("MouseEvents"),
        a = document.createElement("a")
      a.download = theme.name + " - BetterCompass Theme.json"
      a.href = window.URL.createObjectURL(blob)
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":")
      e.initEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      )
      a.dispatchEvent(e)
    },
    setTheme(theme) {
      const name = theme.id
      const dark = theme.dark
      const light = theme.light
      this.$vuetify.theme.themes.dark = dark
      this.$vuetify.theme.themes.light = light
      this.$vuetify.theme.themes.name = name
      this.$vuetify.theme.themes.primaryType = theme.primaryType
      if (this.accent && this.defineAccent) {
        this.$vuetify.theme.themes.light.primary = this.accent
        this.$vuetify.theme.themes.dark.primary = this.accent
        this.$store.state.user.bcUser.accentColor = this.accent
      } else {
        this.$store.state.user.bcUser.accentColor = null
      }
      this.name = name
      this.axios
        .put("/api/v1/user/settings/theme", {
          id: name,
          accent: this.defineAccent ? this.accent : null
        })
        .catch((e) => {
          AjaxErrorHandler(this.$store)(e)
        })
    },
    createAccount() {
      if (this.agree) {
        this.loading = true
        this.axios
          .post("/api/v1/user/create", {
            settings: this.settings
          })
          .then((res) => {
            this.$store.commit("setBetterCompassUser", res.data.user)
            this.createAccountDialog = false
            this.loading = false
          })
          .catch((e) => {
            this.loading = false
            AjaxErrorHandler(this.$store)(e)
          })
      }
    },
    saveSettings() {
      this.loading = true
      this.$vuetify.theme.dark = this.$store.state.user.bcUser?.theme === "dark"

      this.$store
        .dispatch("saveOnlineSettings")
        .then(() => {
          this.loading = false
        })
        .catch((e) => {
          this.loading = false
          AjaxErrorHandler(this.$store)(e)
        })
    },
    onAvatarFileChange(e) {
      const file = e.target.files && e.target.files[0]
      e.target.value = ""
      if (!file) return
      this.avatarError = ""
      this.avatarUploading = true
      fileToResizedDataUrl(file, 256, 0.85)
        .then((dataUrl) => {
          this.$store.state.user.bcUser.discussionsImage = dataUrl
          this.avatarUploading = false
          this.saveSettings()
        })
        .catch((err) => {
          this.avatarUploading = false
          this.avatarError = err.message
        })
    },
    removeAvatar() {
      this.$store.state.user.bcUser.discussionsImage = null
      this.saveSettings()
    },
    onBackgroundFileChange(e) {
      const file = e.target.files && e.target.files[0]
      e.target.value = ""
      if (!file) return
      this.backgroundError = ""
      this.backgroundUploading = true
      fileToResizedDataUrl(file, 1600, 0.75)
        .then((dataUrl) => {
          this.$store.state.user.bcUser.customBackground = dataUrl
          this.backgroundUploading = false
          this.saveSettings()
        })
        .catch((err) => {
          this.backgroundUploading = false
          this.backgroundError = err.message
        })
    },
    fontItems(area) {
      const items = fontChoices(this.fonts)
      if (area.key === "base") return items
      return [{ name: "Same as Everything", value: "" }].concat(items.slice(1))
    },
    saveFonts(next) {
      this.$set(this.$store.state.user.bcUser, "fonts", next)
      this.saveSettings()
    },
    setFont(key, value) {
      this.saveFonts({ ...this.fonts, [key]: value == null ? "" : value })
    },
    addCustomFont() {
      const name = cleanFontName(this.customFontName)
      this.fontError = ""
      if (!name) {
        this.fontError = "Type the name of a font first."
        return
      }
      this.customFontName = ""
      const custom = this.fonts.custom.filter(
        (n) => n.toLowerCase() !== name.toLowerCase()
      )
      custom.push(name)
      // A newly added font becomes the main font straight away, so it is
      // obvious whether this computer actually has it.
      this.saveFonts({
        ...this.fonts,
        custom: custom.slice(-12),
        base: customFontValue(name)
      })
    },
    removeCustomFont(name) {
      const value = customFontValue(name)
      const next = {
        ...this.fonts,
        custom: this.fonts.custom.filter((n) => n !== name)
      }
      this.fontAreas.forEach((a) => {
        if (next[a.key] === value) next[a.key] = ""
      })
      this.saveFonts(next)
    },
    onFontFileChange(e) {
      const file = e.target.files && e.target.files[0]
      e.target.value = ""
      if (!file) return
      this.fontError = ""
      this.fontUploading = true
      readFontFile(file)
        .then((uploaded) => {
          this.fontUploading = false
          this.saveFonts({
            ...this.fonts,
            uploaded,
            base: uploadedFontValue()
          })
        })
        .catch((err) => {
          this.fontUploading = false
          this.fontError = err.message
        })
    },
    removeUploadedFont() {
      const value = uploadedFontValue()
      const next = { ...this.fonts, uploaded: null }
      this.fontAreas.forEach((a) => {
        if (next[a.key] === value) next[a.key] = ""
      })
      this.saveFonts(next)
    },
    resetFonts() {
      this.fontError = ""
      this.saveFonts(defaultFonts())
    },
    removeBackground() {
      this.$store.state.user.bcUser.customBackground = null
      this.saveSettings()
    }
  },
  mounted() {
    this.defineAccent = this.$store.state.user.bcUser?.accentColor !== null
    this.accent = this.$store.state.user.bcUser?.accentColor
    this.name = this.$vuetify.theme.themes.name
    this.getThemes()
  },
  watch: {
    creator() {
      this.$vuetify.theme.themes.dark = this.creator.dark
      this.$vuetify.theme.themes.light = this.creator.light
      this.$vuetify.theme.themes.name = this.creator.id
    },
    accent() {
      this.setTheme(
        this.themes.find(
          (theme) => theme.id === this.$vuetify.theme.themes.name
        )
      )
    },
    defineAccent() {
      if (!this.defineAccent) {
        this.accent = null
        this.setTheme(
          this.themes.find(
            (theme) => theme.id === this.$vuetify.theme.themes.name
          )
        )
      } else {
        this.accent = this.$store.state.user.bcUser?.accentColor || "#0190ea"
      }
    },
    "$store.state.user.bcUser.theme": {
      handler() {
        this.$vuetify.theme.dark =
          this.$store.state.user.bcUser.theme === "dark"
      },
      deep: true
    }
  }
}
</script>
