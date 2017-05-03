<template>
  <div id="app">
    <md-toolbar>
      <h1 class="md-title" style="flex: 1">Timezones with Vuex</h1>
  
      <md-button class="md-icon-button" @click.native="openDialog('clear-all-confirmation-dialog')" :disabled="shownTimezones.length == 0">
        <md-icon>clear_all</md-icon>
      </md-button>
  
      <md-button class="md-icon-button" @click.native="openDialog('add-timezone-dialog')">
        <md-icon>add</md-icon>
      </md-button>
    </md-toolbar>
  
    <div class="main-content">
      <md-layout>
        <md-layout v-for="timezoneValue in shownTimezones" :key="timezoneValue" class="timezone-card-wrapper">
          <timezone-card :timezone-name="availableTimezones.get(timezoneValue).text" :timezone-key="availableTimezones.get(timezoneValue).utc[0]" v-on:remove="removeTimezone(timezoneValue)" class="md-flex">
          </timezone-card>
        </md-layout>
      </md-layout>
    </div>
  
    <clear-all-confirmation-dialog ref="clear-all-confirmation-dialog" v-on:confirm="clearAll();">
    </clear-all-confirmation-dialog>
  
    <add-timezone-dialog ref="add-timezone-dialog" :timezones="notAddedTimezones" v-on:add-timezone="addTimezone">
    </add-timezone-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import TimezoneCard from './components/TimezoneCard'
import ClearAllConfirmationDialog from './components/ClearAllConfirmationDialog'
import AddTimezoneDialog from './components/AddTimezoneDialog'
import {
  ADD_AVAILABLE_TIMEZONE, ADD_SHOWN_TIMEZONE,
  REMOVE_SHOWN_TIMEZONE, CLEAR_SHOWN_TIMEZONES
} from './store/mutations'

export default {
  name: 'app',
  components: {
    TimezoneCard, ClearAllConfirmationDialog, AddTimezoneDialog
  },
  props: ['timezones'],
  created: function () {
    // Add timezones from timezones property into our availableTimezones Map in store
    for (let i = 0; i < this.timezones.length; ++i) {
      const timezone = this.timezones[i]
      if (timezone.utc && timezone.utc.length > 0) {
        // Omit timezones withou utc field, the utc field is used to identify
        // the timezone in momenttz.js to get the proper current time.
        // Timezones withou utc field are old and unused (nothing returned by googling of such timezones)
        // At the time of writing (10.4.2017) there were 2 such timezones
        this.commitAddAvailableTimezone(timezone)
      }
    }

    // Try to load previously shown timezones from localStorage
    if (typeof (Storage) !== 'undefined' && localStorage.shownTimezones) {
      // Browser supports localStorage and shownTimezones are stored
      // Make sure all stored timezones are contained in available timezones, otherwise drop them
      const storedTimezones = JSON.parse(localStorage.shownTimezones)
      for (let i = 0; i < storedTimezones.length; ++i) {
        const storedTimezoneValue = storedTimezones[i]
        if (this.availableTimezones.has(storedTimezoneValue)) {
          this.commitAddShownTimezone(storedTimezoneValue)
        }
      }
    }
  },
  computed: {
    availableTimezonesList() {
      return Array.from(this.availableTimezones.values())
        .sort((left, right) => left.offset - right.offset)
    },
    notAddedTimezones() {
      return this.availableTimezonesList.filter(e => !this.shownTimezones.includes(e.value))
    },
    ...mapState([
      'availableTimezones',
      'shownTimezones'
    ])
  },
  methods: {
    openDialog(ref) {
      // Since dialogs are contained in their custom components the ref
      // contains wrapper Vue instance which contains the dialog as it's
      // first child.
      this.$refs[ref].$children[0].open()
    },
    commitAddAvailableTimezone(timezone) {
      this.$store.commit(ADD_AVAILABLE_TIMEZONE, {
        timezoneKey: timezone.value,
        timezone
      })
    },
    commitAddShownTimezone(timezoneValue) {
      this.$store.commit(ADD_SHOWN_TIMEZONE, {
        timezoneKey: timezoneValue
      })
    },
    commitRemoveShownTimezone(timezoneValue) {
      this.$store.commit(REMOVE_SHOWN_TIMEZONE, {
        timezoneKey: timezoneValue
      })
    },
    commitClearAllTimezons() {
      this.$store.commit(CLEAR_SHOWN_TIMEZONES)
    },
    updateStoredShownTimezones() {
      localStorage.shownTimezones = JSON.stringify(this.shownTimezones)
    },
    addTimezone(timezone) {
      this.commitAddShownTimezone(timezone.value)
      this.updateStoredShownTimezones()
    },
    removeTimezone(timezoneValue) {
      this.commitRemoveShownTimezone(timezoneValue)
      this.updateStoredShownTimezones()
    },
    clearAll() {
      this.commitClearAllTimezons()
      this.updateStoredShownTimezones()
    }
  }
}
</script>

<style>
.main-content {
  padding: 16px;
}

.timezone-card-wrapper {
  margin: 16px;
  min-width: 280px;
}
</style>
