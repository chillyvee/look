<template>
  <div>
    <b-card
      bg-variant="secondary"
      style="color: #fff"
    >
      <div
        class="d-flex flex-row align-items-center text-truncate"
      >
        <b-avatar
          id="address-qr"
          rounded
          size="52"
        >
          <feather-icon
            icon="CameraIcon"
            size="32"
          />
        </b-avatar>
        <div class="ml-2">
          <h3
            style="color: #fff"
            class="mb-0"
          >
            Address: <feather-icon
              icon="CopyIcon"
              size="18"
              @click="copy()"
            />
          </h3>
          {{ address }}
        </div>
      </div>
    </b-card>
    <b-card
      class="d-flex flex-row"
    >
      <b-card-header class="pt-0 pl-0 pr-0">
        <b-card-title>Assets</b-card-title>
        <b-button
          v-b-modal.transfer-window
          variant="primary"
          size="sm"
        >
          Transfer
        </b-button>
      </b-card-header>
      <b-card-body class="pl-0 pr-0">
        <b-row>
          <b-col
            class="border-right"
            xm="12"
            md="4"
          >
            <chartjs-component-doughnut-chart
              v-if="chartData"
              :height="235"
              :width="235"
              :data="chartData"
              :chart-data="chartData"
              :options="doughnutChart.options"
              class="mb-3"
            />
          </b-col>
          <b-col
            xm="12"
            md="8"
          >
            <!-- tokens -->
            <div
              v-for="(token, index) in assetTable.items"
              :key="`asset-${index}`"
              class="d-flex justify-content-between mb-1"
            >
              <div class="d-flex align-items-center">
                <b-avatar
                  :variant="`light-${token.color}`"
                  rounded
                >
                  <feather-icon
                    :icon="token.icon"
                    size="16"
                    :class="`text-${token.color}`"
                  />
                </b-avatar>
                <span class="font-weight-bold ml-75 d-none d-md-block">{{ token.type }} </span>
                <span class="ml-25">{{ token.percent }}%</span>
              </div>
              <div class="d-flex flex-column">
                <span class="text-right">{{ formatAmount(token.amount) }} {{ formatDenom(token.denom) }}</span>
                <small class="text-right">${{ token.currency }}</small>
              </div>
            </div>
            <!--/ tokens -->
            <div class="text-right border-top pt-1">
              <h2>Total: ${{ assetTable.currency }}</h2>
            </div>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>

    <b-card>
      <b-card-header class="pt-0 pl-0 pr-0">
        <b-card-title>Delegation</b-card-title>
        <div>
          <b-button
            v-b-modal.delegate-window
            variant="primary"
            size="sm"
            class="mr-25"
          >
            Delegate
          </b-button>
          <b-button
            v-if="delegations"
            v-b-modal.withdraw-window
            variant="primary"
            size="sm"
          >
            Withdraw
          </b-button>
        </div>
      </b-card-header>
      <b-card-body class="pl-0 pr-0">
        <b-table
          :items="deleTable"
          stacked="sm"
        >
          <template #cell(action)="data">
            <!-- size -->
            <b-button-group
              size="sm"
            >
              <b-button
                v-b-modal.delegate-window
                v-ripple.400="'rgba(113, 102, 240, 0.15)'"
                v-b-tooltip.hover.top="'Delegate'"
                variant="outline-primary"
                @click="selectValue(data.value)"
              >
                <feather-icon icon="LogInIcon" />
              </b-button>
              <b-button
                v-b-modal.redelegate-window
                v-ripple.400="'rgba(113, 102, 240, 0.15)'"
                v-b-tooltip.hover.top="'Redelegate'"
                variant="outline-primary"
                @click="selectValue(data.value)"
              >
                <feather-icon icon="ShuffleIcon" />
              </b-button>
              <b-button
                v-b-modal.unbond-window
                v-ripple.400="'rgba(113, 102, 240, 0.15)'"
                v-b-tooltip.hover.top="'Unbond'"
                variant="outline-primary"
                @click="selectValue(data.value)"
              >
                <feather-icon icon="LogOutIcon" />
              </b-button>
            </b-button-group>
          </template>
        </b-table>
      </b-card-body>
    </b-card>

    <b-card
      v-if="account"
      :title="accountTitle"
      class="text-trancate"
    >
      <b-table-simple stacked="sm">
        <b-tbody v-if="account.type === 'cosmos-sdk/BaseAccount'">
          <b-tr>
            <b-td class="max-width:100px;">
              Account Number
            </b-td><b-td> {{ account.value.account_number }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> Sequence </b-td><b-td> {{ account.value.sequence }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> Public Key </b-td><b-td> <object-field-component :tablefield="account.value.public_key" /> </b-td>
          </b-tr>
        </b-tbody>
        <b-tbody v-if="account.type === 'cosmos-sdk/PeriodicVestingAccount'">
          <b-tr>
            <b-td class="max-width:100px;">
              Account Number
            </b-td><b-td> {{ account.value.base_vesting_account.base_account.account_number }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> Sequence </b-td><b-td> {{ account.value.base_vesting_account.base_account.sequence }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> Public Key </b-td><b-td> <object-field-component :tablefield="account.value.base_vesting_account.base_account.public_key" /> </b-td>
          </b-tr>
          <b-tr>
            <b-td> Original Vesting </b-td><b-td> {{ formatToken(account.value.base_vesting_account.original_vesting) }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> Delegated Free </b-td><b-td> {{ formatToken(account.value.base_vesting_account.delegated_free) }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> Delegated Vesting </b-td><b-td> {{ formatToken(account.value.base_vesting_account.delegated_vesting) }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> Vesting Time </b-td><b-td> {{ formatTime(account.value.start_time) }} - {{ formatTime(account.value.base_vesting_account.end_time) }}</b-td>
          </b-tr>
          <b-tr>
            <b-td> Vesting Periods </b-td>
            <b-td>
              <b-table-simple>
                <th>Length</th><th>Amount</th>
                <b-tr
                  v-for="p, index in account.value.vesting_periods"
                  :key="index"
                >
                  <td><small>{{ p.length }} <br>{{ formatLength(p.length) }}</small> </td><td>{{ formatToken(p.amount) }}</td>
                </b-tr>
              </b-table-simple>
            </b-td>
          </b-tr>
        </b-tbody>
        <b-tbody v-if="account.type === 'cosmos-sdk/DelayedVestingAccount'">
          <b-tr>
            <b-td style="max-width:100px;">
              Account Number
            </b-td><b-td> {{ account.value.base_vesting_account.base_account.account_number }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> Sequence </b-td><b-td> {{ account.value.base_vesting_account.base_account.sequence }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> Public Key </b-td><b-td> <object-field-component :tablefield="account.value.base_vesting_account.base_account.public_key" /> </b-td>
          </b-tr>
          <b-tr>
            <b-td> Original Vesting </b-td><b-td> {{ formatToken(account.value.base_vesting_account.original_vesting) }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> Delegated Free </b-td><b-td> {{ formatToken(account.value.base_vesting_account.delegated_free) }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> Delegated Vesting </b-td><b-td> {{ formatToken(account.value.base_vesting_account.delegated_vesting) }} </b-td>
          </b-tr>
          <b-tr>
            <b-td> End Time </b-td><b-td> {{ formatTime(account.value.base_vesting_account.end_time) }}</b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </b-card>

    <b-popover
      target="address-qr"
      variant="dark"
      triggers="hover"
      placement="bottom"
    >
      <vue-qr :text="address" />
    </b-popover>

    <operation-transfer-component :address="address" />
    <operation-withdraw-component :address="address" />
    <operation-unbond-component
      :address="address"
      :validator-address.sync="selectedValidator"
    />
    <operation-delegate-component
      :address="address"
      :validator-address.sync="selectedValidator"
    />
    <operation-redelegate-component
      :address="address"
      :validator-address.sync="selectedValidator"
    />
  </div>
</template>

<script>
import {
  BCard, BAvatar, BPopover, BTable, BRow, BCol, BTableSimple, BTr, BTd, BTbody, BCardHeader, BCardTitle, BButton, BCardBody, VBModal,
  BButtonGroup, VBTooltip,
} from 'bootstrap-vue'
import FeatherIcon from '@/@core/components/feather-icon/FeatherIcon.vue'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import Ripple from 'vue-ripple-directive'
import VueQr from 'vue-qr'
import chainAPI from '@/libs/fetch'
import {
  formatToken, formatTokenAmount, formatTokenDenom, getStakingValidatorOperator, percent, tokenFormatter, toDay, toDuration,
} from '@/libs/data'
import { $themeColors } from '@themeConfig'
import ObjectFieldComponent from './ObjectFieldComponent.vue'
import ChartjsComponentDoughnutChart from './ChartjsComponentDoughnutChart.vue'
import OperationTransferComponent from './OperationTransferComponent.vue'
import OperationWithdrawComponent from './OperationWithdrawComponent.vue'
import OperationUnbondComponent from './OperationUnbondComponent.vue'
import OperationDelegateComponent from './OperationDelegateComponent.vue'
import OperationRedelegateComponent from './OperationRedelegateComponent.vue'

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
    // eslint-disable-next-line vue/no-unused-components
    ToastificationContent,
    ObjectFieldComponent,
    ChartjsComponentDoughnutChart,
    OperationTransferComponent,
    OperationWithdrawComponent,
    OperationDelegateComponent,
    OperationRedelegateComponent,
    OperationUnbondComponent,
  },
  directives: {
    'b-modal': VBModal,
    'b-tooltip': VBTooltip,
    Ripple,
  },
  data() {
    const { address } = this.$route.params
    return {
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
      doughnutChart: {
        options: {
          responsive: true,
          maintainAspectRatio: false,
          responsiveAnimationDuration: 500,
          cutoutPercentage: 60,
          legend: {
            display: true,
            title: {
              display: true,
            },
          },
          tooltips: {
            callbacks: {
              label(tooltipItem, data) {
                const label = data.datasets[0].labels[tooltipItem.index] || ''
                const value = data.datasets[0].data[tooltipItem.index]
                const total = data.datasets[0].data.reduce((t, c) => t + c)
                const output = ` ${label} : ${percent(value / total)} %`
                return output
              },
            },
            // Updated default tooltip UI
            shadowOffsetX: 1,
            shadowOffsetY: 1,
            shadowBlur: 8,
            // shadowColor: chartColors.tooltipShadow,
            // backgroundColor: $themeColors.light,
            // titleFontColor: $themeColors.dark,
            // bodyFontColor: $themeColors.dark,
          },
        },
      },
    }
  },
  computed: {
    accountTitle() {
      if (this.account) {
        return this.account.type.substring(this.account.type.indexOf('/') + 1)
      }
      return ''
    },
    assetTable() {
      let total = []
      let sum = 0
      let sumCurrency = 0
      total = total.concat(this.assets.map(x => {
        const xh = x
        xh.type = 'Balance'
        xh.color = 'primary'
        xh.icon = 'CreditCardIcon'
        xh.currency = this.formatCurrency(xh.amount, xh.denom)
        sumCurrency += xh.currency
        sum += Number(xh.amount)
        return xh
      }))

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
          color: 'success',
          icon: 'LockIcon',
          amount: temp,
          denom: stakingDenom,
          currency: this.formatCurrency(temp, stakingDenom),
        })
      }

      if (this.reward.total) {
        total = total.concat(this.reward.total.map(x => {
          const xh = x
          xh.type = 'Reward'
          xh.color = 'warning'
          xh.icon = 'TrendingUpIcon'
          xh.currency = this.formatCurrency(xh.amount, xh.denom)
          sumCurrency += xh.currency
          sum += Number(xh.amount)
          return xh
        }))
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
        this.redelegations.forEach(x => {
          x.entries.forEach(e => {
            tmp1 += Number(e.balance)
          })
        })
        total.push({
          type: 'unbonding',
          color: 'danger',
          icon: 'TrendingDownIcon',
          denom: stakingDenom,
          amount: tmp1,
          percent: 0,
          currency: 0,
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
            backgroundColor: [$themeColors.primary, $themeColors.success, $themeColors.warning, $themeColors.danger, $themeColors.info],
            borderWidth: 0,
            pointStyle: 'rectRounded',
          },
        ],
      }
    },
    deleTable() {
      const re = []
      if (this.reward.rewards && this.delegations) {
        this.delegations.forEach(e => {
          const reward = this.reward.rewards.find(r => r.validator_address === e.delegation.validator_address)
          re.push({
            validator: getStakingValidatorOperator(this.$http.config.chain_name, e.delegation.validator_address, 8),
            token: formatToken(e.balance),
            reward: tokenFormatter(reward.reward),
            action: e.delegation.validator_address,
          })
        })
      }
      return re
    },
    accTable() {
      let table = {}
      if (this.account && this.account.type === 'cosmos-sdk/PeriodicVestingAccount') {
        table = this.account.value
      }
      return table
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
          chainAPI.getIBCDenomTraceText(this.$http.config.api, x.denom).then(denom => {
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
    this.$http.getStakingReward(this.address).then(res => {
      this.reward = res
    })
    this.$http.getStakingDelegations(this.address).then(res => {
      this.delegations = res.delegation_responses
    })
    this.$http.getStakingRedelegations(this.address).then(res => {
      this.redelegations = res.redelegation_responses
    })
    this.$http.getStakingUnbonding(this.address).then(res => {
      this.unbonding = res.unbonding_responses
    })
    // this.$http.getStakingValidators(this.address).then(res => {
    //   console.log(res)
    // })
  },
  methods: {
    selectValue(v) {
      this.selectedValidator = v
    },
    formatDenom(v) {
      return formatTokenDenom(this.denoms[v] ? this.denoms[v] : v)
    },
    formatAmount(v) {
      return formatTokenAmount(v)
    },
    formatToken(v) {
      return tokenFormatter(v)
    },
    formatCurrency(amount, denom) {
      const qty = this.formatAmount(amount)
      const d2 = this.formatDenom(denom)
      const userCurrency = 'USD'
      const quote = this.quotes[d2]
      if (quote && quote.quote) {
        const { price } = quote.quote[userCurrency]
        return parseFloat((qty * price).toFixed(2))
      }
      return 0
    },
    formatTime: v => toDay(Number(v) * 1000),
    formatLength: v => toDuration(Number(v) * 1000),
    copy() {
      this.$copyText(this.address).then(() => {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Address copied',
            icon: 'BellIcon',
          },
        })
      }, e => {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: `Failed to copy address! ${e}`,
            icon: 'BellIcon',
            variant: 'danger',
          },
        })
      })
    },
  },
}
</script>
