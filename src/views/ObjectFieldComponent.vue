<template>
  <b-table-simple
    v-if="typeof tablefield === 'object'"
    hover
    :small="small"
    striped
    stacked="sm"
    responsive="sm"
  >
    <b-tbody>
      <b-tr
        v-for="(value, name) in tablefield"
        :key="name"
      >
        <b-td
          style="text-transform: capitalize; vertical-align: top;"
        >
          {{ name }}
        </b-td>
        <b-td v-if="isTokenField(value)">
          {{ formatTokens( value ) }}
        </b-td>
        <b-td v-else-if="isArrayText(value)">
          {{ value.join(', ') }}
        </b-td>
        <b-td v-else-if="isHex(value)">
          {{ formatHexAddress(value) }}
        </b-td>
        <b-td v-else-if="Array.isArray(value)">
          <array-field-component :tablefield="value" />
        </b-td>
        <b-td
          v-else-if="typeof (value) ==='object'"
          hover
          class="overflow-hidden"
        >
          <b-tabs small>
            <b-tab
              v-for="key in Object.keys(value)"
              :key="key"
              :title="key"
              class="pl-0 pr-0"
              title-item-class="bg-light-primary"
              style="padding: 0px;"
            >
              <array-field-component
                v-if="Array.isArray(value[key])"
                :tablefield="value[key]"
              />
              <object-field-component
                v-else-if="typeof value[key] === 'object'"
                :tablefield="value[key]"
              />
              <span v-else>{{ formatText(value[key]) }} </span>
            </b-tab>
          </b-tabs>
        </b-td>
        <b-td v-else>
          {{ value }}
        </b-td>
      </b-tr>
    </b-tbody>
  </b-table-simple>
</template>

<script>
import {
  BTableSimple, BTr, BTd, BTabs, BTab, BTbody,
} from 'bootstrap-vue'
import {
  abbr, getStakingValidatorByHex, isHexAddress, isStringArray, isToken, tokenFormatter,
} from '@/libs/data'
import ArrayFieldComponent from './ArrayFieldComponent.vue'

export default {
  name: 'ObjectFieldComponent',
  components: {
    BTableSimple,
    BTr,
    BTd,
    BTabs,
    BTab,
    BTbody,
    ArrayFieldComponent,
  },
  props: {
    tablefield: {
      type: [Array, Object],
      default: () => {},
    },
    small: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    formatObject(value) {
      // console.log(value, typeof (value) === 'object', Object.keys(value))
      // if (typeof (value) === 'object' && Object.keys(value).length === 1) {
      //   console.log(value)
      //   return value[Object.keys(value)[0]]
      // }
      return value
    },
    formatText: v => abbr(v, 60),
    eval_value(value) {
      return Array.from(value)
    },
    isTokenField(value) {
      return isToken(value)
    },
    isHex(value) {
      return isHexAddress(value)
    },
    formatHexAddress(v) {
      return getStakingValidatorByHex(this.$http.config.chain_name, v)
    },
    isArrayText(value) {
      return isStringArray(value)
    },
    formatTokens(value) {
      return tokenFormatter(value)
    },
  },
}
</script>

<style lang='css'>
@media (min-width: 768px) {
  td:first-child { width: 20% ;}
}
</style>
