<template>
  <div>
    <b-card bg-variant="secondary" style="color: #fff">
      <div class="d-flex flex-row align-items-center text-truncate">
        <b-avatar id="address-qr" rounded size="52">
          <feather-icon icon="CameraIcon" size="32" />
        </b-avatar>
        <div class="ml-2">
          <h3 style="color: #fff" class="mb-0">
            Address: <feather-icon icon="CopyIcon" size="18" @click="copy()" />
          </h3>
          {{ address }}
        </div>
      </div>
    </b-card>
    <b-card class="d-flex flex-row">
      <b-card-header class="pt-0 pl-0 pr-0">
        <b-card-title>Assets</b-card-title>
      </b-card-header>
      <b-card-body class="pl-0 pr-0">
        <b-row>
          <b-col xm="12" md="4">
            <chart-component-doughnut
              v-if="chartData"
              :height="235"
              :width="235"
              :data="chartData"
              class="mb-3"
            />
          </b-col>
          <b-col class="border-left d-none d-md-block" md="1" />
          <b-col xm="12" md="7">
            <!-- tokens -->
            <div
              v-for="(token, index) in assetTable.items"
              :key="`asset-${index}`"
              class="d-flex justify-content-between mb-1"
            >
              <div class="d-flex align-items-center">
                <b-avatar :variant="`light-${token.color}`" rounded>
                  <feather-icon
                    :icon="token.icon"
                    size="16"
                    :class="`text-${token.color}`"
                  />
                </b-avatar>
                <span class="font-weight-bold ml-75 d-none d-md-block"
                  >{{ token.type }}
                </span>
                <span class="ml-25">{{ token.percent }}%</span>
              </div>
              <div class="d-flex flex-column">
                <span class="text-right">{{ formatToken(token) }}</span>
                <small class="text-right"
                  >{{ currency }}{{ token.currency }}</small
                >
              </div>
            </div>
            <!--/ tokens -->
            <div class="text-right border-top pt-1">
              <h2>Total: {{ currency }}{{ assetTable.currency }}</h2>
            </div>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>

    <b-card v-if="delegations">
      <b-card-header class="pt-0 pl-0 pr-0">
        <b-card-title
          >Delegation Calculator Thingamabob
          <font color="red">(mostly untested 😊 )</font></b-card-title
        >
        <div>
          <b-button
            v-b-modal.delegate-window
            variant="primary"
            size="sm"
            class="mr-25"
          >
            <feather-icon icon="LogInIcon" class="d-md-none" /><small
              class="d-none d-md-block"
              >Delegate: New Validator</small
            >
          </b-button>
          <b-button
            v-if="delegations"
            v-b-modal.withdraw-window
            variant="primary"
            size="sm"
          >
            <feather-icon icon="ShareIcon" class="d-md-none" /><small
              class="d-none d-md-block"
            >
              Claim Rewards</small
            >
          </b-button>
        </div>
      </b-card-header>
      <b-card-body class="pl-0 pr-0">
        <!--
          {{ $http.config }}
          -->
        <div class="mt-1">
          <b>Step 1:</b>Total Amount To Delegate:
          <input v-model="wantToDelegate" placeholder="0" /> Full Units
          (whatever it is for this chain :) )

          <br />
          <br />
          <b>Step 2</b> Choose how you want to split your delegation
          <select v-model="allocMethod">
            <option value="even">Even Split</option>
            <option value="ratio">Keep Ratio</option>
            <option value="decentralize">Decentralize (coming someday)</option>
          </select>
          <br />
          <br />

          <b>Step 3:</b> Click the delegate button below (the first action
          button. The second one is redelegate and is there just to confuse you)
          <br />
          <br />

          <b>Step 4:</b> This UI is <b>dumb</b> and can't tell when your
          delegation has been commited to the blockchain. Click this
          <b-button
            variant="info"
            size="sm"
            class="mr-25"
            @click="reloadDelegations"
          >
            <feather-icon icon="RefreshCwIcon" class="d-md-none" /><small
              class="d-none d-md-block"
              >Reload Delegation Amounts</small
            >
          </b-button>
          about 15 seconds after each delegation to verify the "Current" amount
          increases. Then make your next delegation.
          <font color="red">{{ reloadMessage }}</font>
          <br />
          <br />
          <b>Step 5:</b>Review the "Add Amount" delegations below. To execute
          the allocations click:
          <b-button
            variant="info"
            size="sm"
            class="mr-25"
            v-b-modal.multi-delegate-window
            @click="tryMultiDelegate"
          >
            <feather-icon icon="RefreshCwIcon" class="d-md-none" /><small
              class="d-none d-md-block"
              >Execute Multi Delegate</small
            >
          </b-button>
        </div>
        <b-table :items="delegationTable" stacked="sm">
          <template #cell(action)="data">
            <!-- size -->
            <b-button-group size="sm">
              <b-button
                v-b-modal.delegate-window
                v-ripple.400="'rgba(113, 102, 240, 0.15)'"
                v-b-tooltip.hover.top="'Delegate'"
                variant="outline-primary"
                @click="selectValue(data)"
              >
                <feather-icon icon="LogInIcon" />
              </b-button>
              <b-button
                v-b-modal.redelegate-window
                v-ripple.400="'rgba(113, 102, 240, 0.15)'"
                v-b-tooltip.hover.top="'Redelegate'"
                variant="outline-primary"
                @click="selectValue(data)"
              >
                <feather-icon icon="ShuffleIcon" />
              </b-button>
              <!--
              <b-button
                v-b-modal.unbond-window
                v-ripple.400="'rgba(113, 102, 240, 0.15)'"
                v-b-tooltip.hover.top="'Unbond'"
                variant="outline-primary"
                @click="selectValue(data)"
              >
                <feather-icon icon="LogOutIcon" />
              </b-button>
              -->
            </b-button-group>
          </template>
        </b-table>
      </b-card-body>
    </b-card>

    <b-popover
      target="address-qr"
      variant="dark"
      triggers="hover"
      placement="bottom"
    >
      <vue-qr :text="address" />
    </b-popover>

    <operation-withdraw-component :address="address" />
    <operation-unbond-component
      :address="address"
      :validator-address.sync="selectedValidator"
    />
    <operation-delegate-component
      :address="address"
      :validator-address.sync="selectedValidator"
      :ask-amount.sync="askAmount"
    />
    <operation-multi-delegate-component
      :address="address"
      :delegationTable.sync="delegationTable"
    />
    <operation-redelegate-component
      :address="address"
      :validator-address.sync="selectedValidator"
    />
  </div>
</template>

<script>
import { $themeColors } from '@themeConfig'
import {
  BCard,
  BAvatar,
  BPopover,
  BTable,
  BRow,
  BCol,
  BTableSimple,
  BTr,
  BTd,
  BTbody,
  BCardHeader,
  BCardTitle,
  BButton,
  BCardBody,
  VBModal,
  BButtonGroup,
  VBTooltip,
  BPagination,
} from 'bootstrap-vue'
import FeatherIcon from '@/@core/components/feather-icon/FeatherIcon.vue'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import Ripple from 'vue-ripple-directive'
import VueQr from 'vue-qr'
import chainAPI from '@/libs/fetch'
import {
  formatToken,
  formatTokenAmount,
  formatTokenDenom,
  getStakingValidatorOperator,
  percent,
  tokenFormatter,
  toDay,
  toDuration,
  abbrMessage,
  abbrAddress,
  getUserCurrency,
  getUserCurrencySign,
} from '@/libs/data'
import ObjectFieldComponent from './ObjectFieldComponent.vue'
import OperationTransferComponent from './OperationTransferComponent.vue'
import OperationWithdrawComponent from './OperationWithdrawComponent.vue'
import OperationUnbondComponent from './OperationUnbondComponent.vue'
import OperationDelegateComponent from './OperationDelegateComponent.vue'
import OperationMultiDelegateComponent from './OperationMultiDelegateComponent.vue'
import OperationRedelegateComponent from './OperationRedelegateComponent.vue'
import OperationTransfer2Component from './OperationTransfer2Component.vue'
import ChartComponentDoughnut from './ChartComponentDoughnut.vue'

export default {
  components: {
    BRow,
    BCol,
    BCard,
    BAvatar,
    BPopover,
    BTable,
    FeatherIcon,
    VueQr,
    BTableSimple,
    BTbody,
    BCardHeader,
    BCardTitle,
    BCardBody,
    BButton,
    BButtonGroup,
    BTr,
    BTd,
    BPagination,
    // eslint-disable-next-line vue/no-unused-components
    ToastificationContent,
    ObjectFieldComponent,
    OperationTransferComponent,
    OperationWithdrawComponent,
    OperationDelegateComponent,
    OperationMultiDelegateComponent,
    OperationRedelegateComponent,
    OperationUnbondComponent,
    OperationTransfer2Component,
    ChartComponentDoughnut,
  },
  directives: {
    'b-modal': VBModal,
    'b-tooltip': VBTooltip,
    Ripple,
  },
  data() {
    const { address } = this.$route.params
    return {
      currency: getUserCurrencySign(),
      selectedValidator: '',
      totalCurrency: 0,
      address,
      account: null,
      assets: [],
      denoms: {},
      reward: [],
      delegations: [],
      redelegations: [],
      unbonding: [],
      quotes: {},
      transactions: [],
      wantToDelegate: 0,
      askAmount: 0,
      delegationTable: [],
      snapDelegationTable: [], // CV
      snapDelegationTotal: 0, // CV
      allocMethod: 'even', // CV: even, ratio, decentralize
      reloadMessage: '', // CV
    }
  },
  computed: {
    accountTitle() {
      if (this.account && this.account.type) {
        return this.account.type.substring(this.account.type.indexOf('/') + 1)
      }
      return 'Profile'
    },
    txs() {
      if (this.transactions.txs) {
        return this.transactions.txs.map(x => ({
          height: Number(x.height),
          txhash: x.txhash,
          msgs: abbrMessage(x.tx.msg ? x.tx.msg : x.tx.value.msg),
          time: toDay(x.timestamp),
        }))
      }
      return []
    },
    assetTable() {
      let total = []
      let sum = 0
      let sumCurrency = 0
      total = total.concat(
        this.assets.map(x => {
          const xh = x
          xh.type = 'Balance'
          xh.color = 'success'
          xh.icon = 'CreditCardIcon'
          xh.currency = this.formatCurrency(xh.amount, xh.denom)
          sumCurrency += xh.currency
          sum += Number(xh.amount)
          return xh
        })
      )

      let stakingDenom = ''

      if (this.delegations) {
        let temp = 0
        this.delegations.forEach(x => {
          const xh = x.balance
          temp += Number(xh.amount)
          sumCurrency += this.formatCurrency(xh.amount, xh.denom)
          sum += Number(xh.amount)
          stakingDenom = xh.denom
        })
        total.push({
          type: 'Delegation',
          color: 'primary',
          icon: 'LockIcon',
          amount: temp,
          denom: stakingDenom,
          currency: this.formatCurrency(temp, stakingDenom),
        })
      }

      if (this.reward.total) {
        total = total.concat(
          this.reward.total.map(x => {
            const xh = x
            xh.type = 'Reward'
            xh.color = 'warning'
            xh.icon = 'TrendingUpIcon'
            xh.currency = this.formatCurrency(xh.amount, xh.denom)
            sumCurrency += xh.currency
            sum += Number(xh.amount)
            return xh
          })
        )
      }

      if (this.unbonding) {
        // total = total.concat(this.unbonding.map(x => {
        //   const xh = x.entries[0]
        //   xh.type = 'unbonding'
        //   xh.color = 'text-warning'
        //   xh.icon = 'TrendingUpIcon'
        //   return xh
        // }))
        let tmp1 = 0
        this.unbonding.forEach(x => {
          x.entries.forEach(e => {
            tmp1 += Number(e.balance)
          })
        })
        // this.redelegations.forEach(x => {
        //   x.entries.forEach(e => {
        //     tmp1 += Number(e.balance)
        //   })
        // })
        const unbonding = this.formatCurrency(tmp1, stakingDenom)
        sumCurrency += unbonding
        sum += tmp1
        total.push({
          type: 'unbonding',
          color: 'danger',
          icon: 'TrendingDownIcon',
          denom: stakingDenom,
          amount: tmp1,
          percent: 0,
          currency: unbonding,
        })
      }
      total = total.map(x => {
        const xh = x
        xh.percent = percent(Number(x.amount) / sum)
        return xh
      })
      return {
        items: total,
        currency: parseFloat(sumCurrency.toFixed(2)),
      }
    },

    chartData() {
      const data = this.assetTable.items.reduce((t, c) => {
        const th = t
        if (t[c.type]) {
          th[c.type] += Number(c.amount)
        } else {
          th[c.type] = Number(c.amount)
        }
        return th
      }, [])
      return {
        datasets: [
          {
            labels: Object.keys(data),
            data: Object.values(data),
            backgroundColor: [
              $themeColors.success,
              $themeColors.primary,
              $themeColors.warning,
              $themeColors.danger,
              $themeColors.info,
            ],
            borderWidth: 0,
            pointStyle: 'rectRounded',
          },
        ],
      }
    },
  },
  created() {
    this.$http.getAuthAccount(this.address).then(acc => {
      this.account = acc
    })
    this.$http.getBankAccountBalance(this.address).then(bal => {
      this.assets = bal
      bal.forEach(x => {
        if (x.denom.startsWith('ibc/')) {
          chainAPI
            .getIBCDenomTraceText(this.$http.config.api, x.denom)
            .then(denom => {
              this.$set(this.denoms, x.denom, denom)
              const symbol = formatTokenDenom(denom)
              if (!this.quotes[symbol] && symbol.indexOf('/') === -1) {
                chainAPI.fetchTokenQuote(symbol).then(quote => {
                  this.$set(this.quotes, symbol, quote)
                })
              }
            })
        } else {
          const symbol = formatTokenDenom(x.denom)
          if (!this.quotes[symbol] && symbol.indexOf('/') === -1) {
            chainAPI.fetchTokenQuote(symbol).then(quote => {
              this.$set(this.quotes, symbol, quote)
            })
          }
        }
      })
    })
    this.reloadDelegations({ snap: 1 })
    // this.$http.getStakingRedelegations(this.address).then(res => {
    //   this.redelegations = res.redelegation_responses || res
    // })
    this.$http.getStakingUnbonding(this.address).then(res => {
      this.unbonding = res.unbonding_responses || res
    })
    this.$http.getTxsBySender(this.address).then(res => {
      this.transactions = res
    })

    // this.$http.getStakingValidators(this.address).then(res => {
    //   console.log(res)
    // })
  },
  watch: {
    allocMethod: function(newVal, oldVal) {
      // watch it
      console.log('allocMethod changed: ', newVal, ' | was: ', oldVal)
      this.delegationTable = this.calcDeleTable()
    },
    wantToDelegate: function(newVal, oldVal) {
      // watch it
      console.log('wantToDelegate changed: ', newVal, ' | was: ', oldVal)
      this.delegationTable = this.calcDeleTable()
    },
  },
  methods: {
    getSnapDelegationAmount(targetValAddress) {
      // CV
      // this.snapDelegationTable = this.calcDeleTable()
      return this.snapDelegationTable.find(sd => sd.action == targetValAddress)
        .current
    },
    calcDeleTable() {
      // CV
      const re = []
      if (this.delegations) {
        let delQty = this.delegations.length

        this.delegations.forEach(e => {
          let line = {
            validator: getStakingValidatorOperator(
              this.$http.config.chain_name,
              e.delegation.validator_address,
              8
            ),
          }

          let current = formatToken(e.balance, {}, 2)
          if (this.snapDelegationTable.length > 0) {
            console.log('Use Snap Table')
            line.start = this.getSnapDelegationAmount(
              e.delegation.validator_address
            )
          } else {
            console.log('Use First Pass ')
            line.start = current
          }
          line.current = current
          line.action = e.delegation.validator_address
          if (this.allocMethod == 'even') {
            line.addAmount = this.wantToDelegate / delQty
          } else if (this.allocMethod == 'ratio') {
            line.addAmount =
              this.wantToDelegate *
              (parseFloat(line.start) / this.snapDelegationTotal)
          } else if (this.allocMethod == 'decentralize') {
            line.addAmount = 123456789
          }
          re.push(line)
        })
      }
      return re
    },
    reloadDelegations(options = {}) {
      // CV
      this.reloadMessage = 'Reloading...'
      this.$http.getStakingDelegations(this.address).then(res => {
        this.reloadMessage = ''
        this.delegations = res.delegation_responses || res
        this.delegationTable = this.calcDeleTable()
        if (options.snap) {
          console.log('Take Initial Snapshot')
          this.snapDelegationTable = [...this.delegationTable]
          this.snapDelegationTotal = this.snapDelegationTable
            .map(sd => sd.current)
            .reduce((a, b) => parseFloat(a) + parseFloat(b), 0)
        } else {
          console.log('No Snapshot')
        }
      })
    },
    pageload(v) {
      this.$http.getTxsBySender(this.address, v).then(res => {
        this.transactions = res
      })
    },
    tryMultiDelegate(data) {
      //let item = data.item
      //this.selectedValidator = item.action
      //this.askAmount = item.addAmount
    },
    selectValue(data) {
      let item = data.item
      this.selectedValidator = item.action
      this.askAmount = item.addAmount
    },
    formatHash: abbrAddress,
    formatDenom(v) {
      return formatTokenDenom(this.denoms[v] ? this.denoms[v] : v)
    },
    formatAmount(v, dec = 2, denom = 'uatom') {
      return formatTokenAmount(v, dec, denom)
    },
    formatToken(v) {
      return tokenFormatter(v, this.denoms)
    },
    formatCurrency(amount, denom) {
      const qty = this.formatAmount(amount, 2, denom)
      const d2 = this.formatDenom(denom)
      const userCurrency = getUserCurrency()
      const quote = this.$store.state.chains.quotes[d2]
      if (quote) {
        const price = quote[userCurrency]
        return parseFloat((qty * price).toFixed(2))
      }
      return 0
    },
    formatTime: v => toDay(Number(v) * 1000),
    formatLength: v => toDuration(Number(v) * 1000),
    copy() {
      this.$copyText(this.address).then(
        () => {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Address copied',
              icon: 'BellIcon',
            },
          })
        },
        e => {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: `Failed to copy address! ${e}`,
              icon: 'BellIcon',
              variant: 'danger',
            },
          })
        }
      )
    },
  },
}
</script>
