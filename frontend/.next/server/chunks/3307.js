"use strict";exports.id=3307,exports.ids=[3307],exports.modules={83307:(e,t,a)=>{a.r(t),a.d(t,{W3mPayLoadingView:()=>j,W3mPayView:()=>B,arbitrumUSDC:()=>es,arbitrumUSDT:()=>ed,baseETH:()=>et,baseSepoliaETH:()=>en,baseUSDC:()=>ea,ethereumUSDC:()=>er,ethereumUSDT:()=>el,getExchanges:()=>X,getIsPaymentInProgress:()=>Q,getPayError:()=>Z,getPayResult:()=>J,openPay:()=>K,optimismUSDC:()=>ei,optimismUSDT:()=>eu,pay:()=>q,polygonUSDC:()=>eo,polygonUSDT:()=>ep,solanaSOL:()=>ey,solanaUSDC:()=>ec,solanaUSDT:()=>em});var n=a(37207),r=a(90670),i=a(83479),s=a(42772),o=a(20833),c=a(34862),l=a(61741),u=a(71263),d=a(67668);a(3966),a(64559),a(98855),a(61581),a(1640),a(17035),a(35606),a(1159),a(53876),a(80825),a(44680),a(99863);var p=a(27011),m=a(20007),y=a(64895),h=a(16818),g=a(77870),w=a(9174),E=a(14212);let I={INVALID_PAYMENT_CONFIG:"INVALID_PAYMENT_CONFIG",INVALID_RECIPIENT:"INVALID_RECIPIENT",INVALID_ASSET:"INVALID_ASSET",INVALID_AMOUNT:"INVALID_AMOUNT",UNKNOWN_ERROR:"UNKNOWN_ERROR",UNABLE_TO_INITIATE_PAYMENT:"UNABLE_TO_INITIATE_PAYMENT",INVALID_CHAIN_NAMESPACE:"INVALID_CHAIN_NAMESPACE",GENERIC_PAYMENT_ERROR:"GENERIC_PAYMENT_ERROR",UNABLE_TO_GET_EXCHANGES:"UNABLE_TO_GET_EXCHANGES",ASSET_NOT_SUPPORTED:"ASSET_NOT_SUPPORTED",UNABLE_TO_GET_PAY_URL:"UNABLE_TO_GET_PAY_URL",UNABLE_TO_GET_BUY_STATUS:"UNABLE_TO_GET_BUY_STATUS"},f={[I.INVALID_PAYMENT_CONFIG]:"Invalid payment configuration",[I.INVALID_RECIPIENT]:"Invalid recipient address",[I.INVALID_ASSET]:"Invalid asset specified",[I.INVALID_AMOUNT]:"Invalid payment amount",[I.UNKNOWN_ERROR]:"Unknown payment error occurred",[I.UNABLE_TO_INITIATE_PAYMENT]:"Unable to initiate payment",[I.INVALID_CHAIN_NAMESPACE]:"Invalid chain namespace",[I.GENERIC_PAYMENT_ERROR]:"Unable to process payment",[I.UNABLE_TO_GET_EXCHANGES]:"Unable to get exchanges",[I.ASSET_NOT_SUPPORTED]:"Asset not supported by the selected exchange",[I.UNABLE_TO_GET_PAY_URL]:"Unable to get payment URL",[I.UNABLE_TO_GET_BUY_STATUS]:"Unable to get buy status"};class A extends Error{get message(){return f[this.code]}constructor(e,t){super(f[e]),this.name="AppKitPayError",this.code=e,this.details=t,Error.captureStackTrace&&Error.captureStackTrace(this,A)}}var N=a(30288);class P extends Error{}async function b(e,t){let a=function(){let e=N.OptionsController.getSnapshot().projectId;return`https://rpc.walletconnect.org/v1/json-rpc?projectId=${e}`}(),{sdkType:n,sdkVersion:r,projectId:i}=N.OptionsController.getSnapshot(),s={jsonrpc:"2.0",id:1,method:e,params:{...t||{},st:n,sv:r,projectId:i}},o=await fetch(a,{method:"POST",body:JSON.stringify(s),headers:{"Content-Type":"application/json"}}),c=await o.json();if(c.error)throw new P(c.error.message);return c}async function C(e){return(await b("reown_getExchanges",e)).result}async function S(e){return(await b("reown_getExchangePayUrl",e)).result}async function _(e){return(await b("reown_getExchangeBuyStatus",e)).result}let x=["eip155","solana"],T={eip155:{native:{assetNamespace:"slip44",assetReference:"60"},defaultTokenNamespace:"erc20"},solana:{native:{assetNamespace:"slip44",assetReference:"501"},defaultTokenNamespace:"token"}};function v(e,t){let{chainNamespace:a,chainId:n}=h.u.parseCaipNetworkId(e),r=T[a];if(!r)throw Error(`Unsupported chain namespace for CAIP-19 formatting: ${a}`);let i=r.native.assetNamespace,s=r.native.assetReference;"native"!==t&&(i=r.defaultTokenNamespace,s=t);let o=`${a}:${n}`;return`${o}/${i}:${s}`}var k=a(90687);async function R(e){let{paymentAssetNetwork:t,activeCaipNetwork:a,approvedCaipNetworkIds:n,requestedCaipNetworks:r}=e,i=c.j.sortRequestedNetworks(n,r).find(e=>e.caipNetworkId===t);if(!i)throw new A(I.INVALID_PAYMENT_CONFIG);if(i.caipNetworkId===a.caipNetworkId)return;let o=s.R.getNetworkProp("supportsAllNetworks",i.chainNamespace);if(!(n?.includes(i.caipNetworkId)||o))throw new A(I.INVALID_PAYMENT_CONFIG);try{await s.R.switchActiveNetwork(i)}catch(e){throw new A(I.GENERIC_PAYMENT_ERROR,e)}}async function U(e,t,a){if(t!==y.b.CHAIN.EVM)throw new A(I.INVALID_CHAIN_NAMESPACE);if(!a.fromAddress)throw new A(I.INVALID_PAYMENT_CONFIG,"fromAddress is required for native EVM payments.");let n="string"==typeof a.amount?parseFloat(a.amount):a.amount;if(isNaN(n))throw new A(I.INVALID_PAYMENT_CONFIG);let r=e.metadata?.decimals??18,i=u.ConnectionController.parseUnits(n.toString(),r);if("bigint"!=typeof i)throw new A(I.GENERIC_PAYMENT_ERROR);return await u.ConnectionController.sendTransaction({chainNamespace:t,to:a.recipient,address:a.fromAddress,value:i,data:"0x"})??void 0}async function D(e,t){if(!t.fromAddress)throw new A(I.INVALID_PAYMENT_CONFIG,"fromAddress is required for ERC20 EVM payments.");let a=e.asset,n=t.recipient,r=Number(e.metadata.decimals),i=u.ConnectionController.parseUnits(t.amount.toString(),r);if(void 0===i)throw new A(I.GENERIC_PAYMENT_ERROR);return await u.ConnectionController.writeContract({fromAddress:t.fromAddress,tokenAddress:a,args:[n,i],method:"transfer",abi:k.g.getERC20Abi(a),chainNamespace:y.b.CHAIN.EVM})??void 0}async function O(e,t){if(e!==y.b.CHAIN.SOLANA)throw new A(I.INVALID_CHAIN_NAMESPACE);if(!t.fromAddress)throw new A(I.INVALID_PAYMENT_CONFIG,"fromAddress is required for Solana payments.");let a="string"==typeof t.amount?parseFloat(t.amount):t.amount;if(isNaN(a)||a<=0)throw new A(I.INVALID_PAYMENT_CONFIG,"Invalid payment amount.");try{if(!w.O.getProvider(e))throw new A(I.GENERIC_PAYMENT_ERROR,"No Solana provider available.");let n=await u.ConnectionController.sendTransaction({chainNamespace:y.b.CHAIN.SOLANA,to:t.recipient,value:a,tokenMint:t.tokenMint});if(!n)throw new A(I.GENERIC_PAYMENT_ERROR,"Transaction failed.");return n}catch(e){if(e instanceof A)throw e;throw new A(I.GENERIC_PAYMENT_ERROR,`Solana payment failed: ${e}`)}}let L="unknown",M=(0,p.sj)({paymentAsset:{network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},recipient:"0x0",amount:0,isConfigured:!1,error:null,isPaymentInProgress:!1,exchanges:[],isLoading:!1,openInNewTab:!0,redirectUrl:void 0,payWithExchange:void 0,currentPayment:void 0,analyticsSet:!1,paymentId:void 0}),$={state:M,subscribe:e=>(0,p.Ld)(M,()=>e(M)),subscribeKey:(e,t)=>(0,m.VW)(M,e,t),async handleOpenPay(e){this.resetState(),this.setPaymentConfig(e),this.subscribeEvents(),this.initializeAnalytics(),M.isConfigured=!0,g.X.sendEvent({type:"track",event:"PAY_MODAL_OPEN",properties:{exchanges:M.exchanges,configuration:{network:M.paymentAsset.network,asset:M.paymentAsset.asset,recipient:M.recipient,amount:M.amount}}}),await o.I.open({view:"Pay"})},resetState(){M.paymentAsset={network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},M.recipient="0x0",M.amount=0,M.isConfigured=!1,M.error=null,M.isPaymentInProgress=!1,M.isLoading=!1,M.currentPayment=void 0},setPaymentConfig(e){if(!e.paymentAsset)throw new A(I.INVALID_PAYMENT_CONFIG);try{M.paymentAsset=e.paymentAsset,M.recipient=e.recipient,M.amount=e.amount,M.openInNewTab=e.openInNewTab??!0,M.redirectUrl=e.redirectUrl,M.payWithExchange=e.payWithExchange,M.error=null}catch(e){throw new A(I.INVALID_PAYMENT_CONFIG,e.message)}},getPaymentAsset:()=>M.paymentAsset,getExchanges:()=>M.exchanges,async fetchExchanges(){try{M.isLoading=!0;let e=await C({page:0,asset:v(M.paymentAsset.network,M.paymentAsset.asset),amount:M.amount.toString()});M.exchanges=e.exchanges.slice(0,2)}catch(e){throw l.SnackController.showError(f.UNABLE_TO_GET_EXCHANGES),new A(I.UNABLE_TO_GET_EXCHANGES)}finally{M.isLoading=!1}},async getAvailableExchanges(e){try{let t=e?.asset&&e?.network?v(e.network,e.asset):void 0;return await C({page:e?.page??0,asset:t,amount:e?.amount?.toString()})}catch(e){throw new A(I.UNABLE_TO_GET_EXCHANGES)}},async getPayUrl(e,t,a=!1){try{let n=Number(t.amount),r=await S({exchangeId:e,asset:v(t.network,t.asset),amount:n.toString(),recipient:`${t.network}:${t.recipient}`});return g.X.sendEvent({type:"track",event:"PAY_EXCHANGE_SELECTED",properties:{source:"pay",exchange:{id:e},configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:n},currentPayment:{type:"exchange",exchangeId:e},headless:a}}),a&&(this.initiatePayment(),g.X.sendEvent({type:"track",event:"PAY_INITIATED",properties:{source:"pay",paymentId:M.paymentId||L,configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:n},currentPayment:{type:"exchange",exchangeId:e}}})),r}catch(e){if(e instanceof Error&&e.message.includes("is not supported"))throw new A(I.ASSET_NOT_SUPPORTED);throw Error(e.message)}},async openPayUrl(e,t,a=!1){try{let n=await this.getPayUrl(e.exchangeId,t,a);if(!n)throw new A(I.UNABLE_TO_GET_PAY_URL);let r=e.openInNewTab??!0;return c.j.openHref(n.url,r?"_blank":"_self"),n}catch(e){throw e instanceof A?M.error=e.message:M.error=f.GENERIC_PAYMENT_ERROR,new A(I.UNABLE_TO_GET_PAY_URL)}},subscribeEvents(){M.isConfigured||(u.ConnectionController.subscribeKey("connections",e=>{e.size>0&&this.handlePayment()}),s.R.subscribeChainProp("accountState",e=>{let t=u.ConnectionController.hasAnyConnection(y.b.CONNECTOR_ID.WALLET_CONNECT);e?.caipAddress&&(t?setTimeout(()=>{this.handlePayment()},100):this.handlePayment())}))},async handlePayment(){M.currentPayment={type:"wallet",status:"IN_PROGRESS"};let e=s.R.getActiveCaipAddress();if(!e)return;let{chainId:t,address:a}=h.u.parseCaipAddress(e),n=s.R.state.activeChain;if(!a||!t||!n||!w.O.getProvider(n))return;let r=s.R.state.activeCaipNetwork;if(r&&!M.isPaymentInProgress)try{this.initiatePayment();let e=s.R.getAllRequestedCaipNetworks(),t=s.R.getAllApprovedCaipNetworkIds();switch(await R({paymentAssetNetwork:M.paymentAsset.network,activeCaipNetwork:r,approvedCaipNetworkIds:t,requestedCaipNetworks:e}),await o.I.open({view:"PayLoading"}),n){case y.b.CHAIN.EVM:"native"===M.paymentAsset.asset&&(M.currentPayment.result=await U(M.paymentAsset,n,{recipient:M.recipient,amount:M.amount,fromAddress:a})),M.paymentAsset.asset.startsWith("0x")&&(M.currentPayment.result=await D(M.paymentAsset,{recipient:M.recipient,amount:M.amount,fromAddress:a})),M.currentPayment.status="SUCCESS";break;case y.b.CHAIN.SOLANA:M.currentPayment.result=await O(n,{recipient:M.recipient,amount:M.amount,fromAddress:a,tokenMint:"native"===M.paymentAsset.asset?void 0:M.paymentAsset.asset}),M.currentPayment.status="SUCCESS";break;default:throw new A(I.INVALID_CHAIN_NAMESPACE)}}catch(e){e instanceof A?M.error=e.message:M.error=f.GENERIC_PAYMENT_ERROR,M.currentPayment.status="FAILED",l.SnackController.showError(M.error)}finally{M.isPaymentInProgress=!1}},getExchangeById:e=>M.exchanges.find(t=>t.id===e),validatePayConfig(e){let{paymentAsset:t,recipient:a,amount:n}=e;if(!t)throw new A(I.INVALID_PAYMENT_CONFIG);if(!a)throw new A(I.INVALID_RECIPIENT);if(!t.asset)throw new A(I.INVALID_ASSET);if(null==n||n<=0)throw new A(I.INVALID_AMOUNT)},handlePayWithWallet(){let e=s.R.getActiveCaipAddress();if(!e){E.RouterController.push("Connect");return}let{chainId:t,address:a}=h.u.parseCaipAddress(e),n=s.R.state.activeChain;if(!a||!t||!n){E.RouterController.push("Connect");return}this.handlePayment()},async handlePayWithExchange(e){try{M.currentPayment={type:"exchange",exchangeId:e};let{network:t,asset:a}=M.paymentAsset,n={network:t,asset:a,amount:M.amount,recipient:M.recipient},r=await this.getPayUrl(e,n);if(!r)throw new A(I.UNABLE_TO_INITIATE_PAYMENT);return M.currentPayment.sessionId=r.sessionId,M.currentPayment.status="IN_PROGRESS",M.currentPayment.exchangeId=e,this.initiatePayment(),{url:r.url,openInNewTab:M.openInNewTab}}catch(e){return e instanceof A?M.error=e.message:M.error=f.GENERIC_PAYMENT_ERROR,M.isPaymentInProgress=!1,l.SnackController.showError(M.error),null}},async getBuyStatus(e,t){try{let a=await _({sessionId:t,exchangeId:e});return("SUCCESS"===a.status||"FAILED"===a.status)&&g.X.sendEvent({type:"track",event:"SUCCESS"===a.status?"PAY_SUCCESS":"PAY_ERROR",properties:{message:"FAILED"===a.status?c.j.parseError(M.error):void 0,source:"pay",paymentId:M.paymentId||L,configuration:{network:M.paymentAsset.network,asset:M.paymentAsset.asset,recipient:M.recipient,amount:M.amount},currentPayment:{type:"exchange",exchangeId:M.currentPayment?.exchangeId,sessionId:M.currentPayment?.sessionId,result:a.txHash}}}),a}catch(e){throw new A(I.UNABLE_TO_GET_BUY_STATUS)}},async updateBuyStatus(e,t){try{let a=await this.getBuyStatus(e,t);M.currentPayment&&(M.currentPayment.status=a.status,M.currentPayment.result=a.txHash),("SUCCESS"===a.status||"FAILED"===a.status)&&(M.isPaymentInProgress=!1)}catch(e){throw new A(I.UNABLE_TO_GET_BUY_STATUS)}},initiatePayment(){M.isPaymentInProgress=!0,M.paymentId=crypto.randomUUID()},initializeAnalytics(){M.analyticsSet||(M.analyticsSet=!0,this.subscribeKey("isPaymentInProgress",e=>{if(M.currentPayment?.status&&"UNKNOWN"!==M.currentPayment.status){let e={IN_PROGRESS:"PAY_INITIATED",SUCCESS:"PAY_SUCCESS",FAILED:"PAY_ERROR"}[M.currentPayment.status];g.X.sendEvent({type:"track",event:e,properties:{message:"FAILED"===M.currentPayment.status?c.j.parseError(M.error):void 0,source:"pay",paymentId:M.paymentId||L,configuration:{network:M.paymentAsset.network,asset:M.paymentAsset.asset,recipient:M.recipient,amount:M.amount},currentPayment:{type:M.currentPayment.type,exchangeId:M.currentPayment.exchangeId,sessionId:M.currentPayment.sessionId,result:M.currentPayment.result}}})}}))}},G=(0,n.iv)`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1) var(--apkt-spacing-2)
      calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
  }

  .token-display {
    padding: var(--apkt-spacing-3) var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-5);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    margin-top: var(--apkt-spacing-3);
    margin-bottom: var(--apkt-spacing-3);
  }

  .token-display wui-text {
    text-transform: none;
  }

  wui-loading-spinner {
    padding: var(--apkt-spacing-2);
  }
`;var Y=function(e,t,a,n){var r,i=arguments.length,s=i<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,a):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,a,n);else for(var o=e.length-1;o>=0;o--)(r=e[o])&&(s=(i<3?r(s):i>3?r(t,a,s):r(t,a))||s);return i>3&&s&&Object.defineProperty(t,a,s),s};let B=class extends n.oi{constructor(){super(),this.unsubscribe=[],this.amount="",this.tokenSymbol="",this.networkName="",this.exchanges=$.state.exchanges,this.isLoading=$.state.isLoading,this.loadingExchangeId=null,this.connectedWalletInfo=s.R.getAccountData()?.connectedWalletInfo,this.initializePaymentDetails(),this.unsubscribe.push($.subscribeKey("exchanges",e=>this.exchanges=e)),this.unsubscribe.push($.subscribeKey("isLoading",e=>this.isLoading=e)),this.unsubscribe.push(s.R.subscribeChainProp("accountState",e=>{this.connectedWalletInfo=e?.connectedWalletInfo})),$.fetchExchanges()}get isWalletConnected(){let e=s.R.getAccountData();return e?.status==="connected"}render(){return(0,n.dy)`
      <wui-flex flexDirection="column">
        <wui-flex flexDirection="column" .padding=${["0","4","4","4"]} gap="3">
          ${this.renderPaymentHeader()}

          <wui-flex flexDirection="column" gap="3">
            ${this.renderPayWithWallet()} ${this.renderExchangeOptions()}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}initializePaymentDetails(){let e=$.getPaymentAsset();this.networkName=e.network,this.tokenSymbol=e.metadata.symbol,this.amount=$.state.amount.toString()}renderPayWithWallet(){return!function(e){let{chainNamespace:t}=h.u.parseCaipNetworkId(e);return x.includes(t)}(this.networkName)?(0,n.dy)``:(0,n.dy)`<wui-flex flexDirection="column" gap="3">
        ${this.isWalletConnected?this.renderConnectedView():this.renderDisconnectedView()}
      </wui-flex>
      <wui-separator text="or"></wui-separator>`}renderPaymentHeader(){let e=this.networkName;if(this.networkName){let t=s.R.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.networkName);t&&(e=t.name)}return(0,n.dy)`
      <wui-flex flexDirection="column" alignItems="center">
        <wui-flex alignItems="center" gap="2">
          <wui-text variant="h1-regular" color="primary">${this.amount||"0.0000"}</wui-text>
          <wui-flex class="token-display" alignItems="center" gap="1">
            <wui-text variant="md-medium" color="primary">
              ${this.tokenSymbol||"Unknown Asset"}
            </wui-text>
            ${e?(0,n.dy)`
                  <wui-text variant="sm-medium" color="secondary">
                    on ${e}
                  </wui-text>
                `:""}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}renderConnectedView(){let e=this.connectedWalletInfo?.name||"connected wallet";return(0,n.dy)`
      <wui-list-item
        @click=${this.onWalletPayment}
        ?chevron=${!0}
        ?fullSize=${!0}
        ?rounded=${!0}
        data-testid="wallet-payment-option"
        imageSrc=${(0,i.o)(this.connectedWalletInfo?.icon)}
      >
        <wui-text variant="lg-regular" color="primary">Pay with ${e}</wui-text>
      </wui-list-item>

      <wui-list-item
        icon="power"
        ?rounded=${!0}
        iconColor="error"
        @click=${this.onDisconnect}
        data-testid="disconnect-button"
        ?chevron=${!1}
      >
        <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
      </wui-list-item>
    `}renderDisconnectedView(){return(0,n.dy)`<wui-list-item
      variant="icon"
      iconVariant="overlay"
      icon="wallet"
      ?rounded=${!0}
      @click=${this.onWalletPayment}
      ?chevron=${!0}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay from wallet</wui-text>
    </wui-list-item>`}renderExchangeOptions(){return this.isLoading?(0,n.dy)`<wui-flex justifyContent="center" alignItems="center">
        <wui-spinner size="md"></wui-spinner>
      </wui-flex>`:0===this.exchanges.length?(0,n.dy)`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`:this.exchanges.map(e=>(0,n.dy)`
        <wui-list-item
          @click=${()=>this.onExchangePayment(e.id)}
          data-testid="exchange-option-${e.id}"
          ?chevron=${!0}
          ?disabled=${null!==this.loadingExchangeId}
          ?loading=${this.loadingExchangeId===e.id}
          imageSrc=${(0,i.o)(e.imageUrl)}
        >
          <wui-flex alignItems="center" gap="3">
            <wui-text flexGrow="1" variant="md-medium" color="primary"
              >Pay with ${e.name} <wui-spinner size="sm" color="secondary"></wui-spinner
            ></wui-text>
          </wui-flex>
        </wui-list-item>
      `)}onWalletPayment(){$.handlePayWithWallet()}async onExchangePayment(e){try{this.loadingExchangeId=e;let t=await $.handlePayWithExchange(e);t&&(await o.I.open({view:"PayLoading"}),c.j.openHref(t.url,t.openInNewTab?"_blank":"_self"))}catch(e){console.error("Failed to pay with exchange",e),l.SnackController.showError("Failed to pay with exchange")}finally{this.loadingExchangeId=null}}async onDisconnect(e){e.stopPropagation();try{await u.ConnectionController.disconnect()}catch{console.error("Failed to disconnect"),l.SnackController.showError("Failed to disconnect")}}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}};B.styles=G,Y([(0,r.SB)()],B.prototype,"amount",void 0),Y([(0,r.SB)()],B.prototype,"tokenSymbol",void 0),Y([(0,r.SB)()],B.prototype,"networkName",void 0),Y([(0,r.SB)()],B.prototype,"exchanges",void 0),Y([(0,r.SB)()],B.prototype,"isLoading",void 0),Y([(0,r.SB)()],B.prototype,"loadingExchangeId",void 0),Y([(0,r.SB)()],B.prototype,"connectedWalletInfo",void 0),B=Y([(0,d.Mo)("w3m-pay-view")],B);var V=a(71106),W=a(9346),F=a(98673);a(92383);let z=(0,n.iv)`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }
`;var H=function(e,t,a,n){var r,i=arguments.length,s=i<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,a):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,a,n);else for(var o=e.length-1;o>=0;o--)(r=e[o])&&(s=(i<3?r(s):i>3?r(t,a,s):r(t,a))||s);return i>3&&s&&Object.defineProperty(t,a,s),s};let j=class extends n.oi{constructor(){super(),this.loadingMessage="",this.subMessage="",this.paymentState="in-progress",this.paymentState=$.state.isPaymentInProgress?"in-progress":"completed",this.updateMessages(),this.setupSubscription(),this.setupExchangeSubscription()}disconnectedCallback(){clearInterval(this.exchangeSubscription)}render(){return(0,n.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["7","5","5","5"]}
        gap="9"
      >
        <wui-flex justifyContent="center" alignItems="center"> ${this.getStateIcon()} </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="lg-medium" color="primary">
            ${this.loadingMessage}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">
            ${this.subMessage}
          </wui-text>
        </wui-flex>
      </wui-flex>
    `}updateMessages(){switch(this.paymentState){case"completed":this.loadingMessage="Payment completed",this.subMessage="Your transaction has been successfully processed";break;case"error":this.loadingMessage="Payment failed",this.subMessage="There was an error processing your transaction";break;default:$.state.currentPayment?.type==="exchange"?(this.loadingMessage="Payment initiated",this.subMessage="Please complete the payment on the exchange"):(this.loadingMessage="Awaiting payment confirmation",this.subMessage="Please confirm the payment transaction in your wallet")}}getStateIcon(){switch(this.paymentState){case"completed":return this.successTemplate();case"error":return this.errorTemplate();default:return this.loaderTemplate()}}setupExchangeSubscription(){$.state.currentPayment?.type==="exchange"&&(this.exchangeSubscription=setInterval(async()=>{let e=$.state.currentPayment?.exchangeId,t=$.state.currentPayment?.sessionId;e&&t&&(await $.updateBuyStatus(e,t),$.state.currentPayment?.status==="SUCCESS"&&clearInterval(this.exchangeSubscription))},4e3))}setupSubscription(){$.subscribeKey("isPaymentInProgress",e=>{e||"in-progress"!==this.paymentState||($.state.error||!$.state.currentPayment?.result?this.paymentState="error":this.paymentState="completed",this.updateMessages(),setTimeout(()=>{"disconnected"!==u.ConnectionController.state.status&&o.I.close()},3e3))}),$.subscribeKey("error",e=>{e&&"in-progress"===this.paymentState&&(this.paymentState="error",this.updateMessages())})}loaderTemplate(){let e=V.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4,a=this.getPaymentIcon();return(0,n.dy)`
      <wui-flex justifyContent="center" alignItems="center" style="position: relative;">
        ${a?(0,n.dy)`<wui-wallet-image size="lg" imageSrc=${a}></wui-wallet-image>`:null}
        <wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>
      </wui-flex>
    `}getPaymentIcon(){let e=$.state.currentPayment;if(e){if("exchange"===e.type){let t=e.exchangeId;if(t){let e=$.getExchangeById(t);return e?.imageUrl}}if("wallet"===e.type){let e=s.R.getAccountData()?.connectedWalletInfo?.icon;if(e)return e;let t=s.R.state.activeChain;if(!t)return;let a=W.ConnectorController.getConnectorId(t);if(!a)return;let n=W.ConnectorController.getConnectorById(a);if(!n)return;return F.f.getConnectorImage(n)}}}successTemplate(){return(0,n.dy)`<wui-icon size="xl" color="success" name="checkmark"></wui-icon>`}errorTemplate(){return(0,n.dy)`<wui-icon size="xl" color="error" name="close"></wui-icon>`}};async function K(e){return $.handleOpenPay(e)}async function q(e,t=3e5){if(t<=0)throw new A(I.INVALID_PAYMENT_CONFIG,"Timeout must be greater than 0");try{await K(e)}catch(e){if(e instanceof A)throw e;throw new A(I.UNABLE_TO_INITIATE_PAYMENT,e.message)}return new Promise((e,a)=>{var n;let r=!1,i=setTimeout(()=>{r||(r=!0,o(),a(new A(I.GENERIC_PAYMENT_ERROR,"Payment timeout")))},t);function s(){if(r)return;let t=$.state.currentPayment,a=$.state.error,n=$.state.isPaymentInProgress;if(t?.status==="SUCCESS"){r=!0,o(),clearTimeout(i),e({success:!0,result:t.result});return}if(t?.status==="FAILED"){r=!0,o(),clearTimeout(i),e({success:!1,error:a||"Payment failed"});return}!a||n||t||(r=!0,o(),clearTimeout(i),e({success:!1,error:a}))}let o=(n=[ee("currentPayment",s),ee("error",s),ee("isPaymentInProgress",s)],()=>{n.forEach(e=>{try{e()}catch{}})});s()})}function X(){return $.getExchanges()}function J(){return $.state.currentPayment?.result}function Z(){return $.state.error}function Q(){return $.state.isPaymentInProgress}function ee(e,t){return $.subscribeKey(e,t)}j.styles=z,H([(0,r.SB)()],j.prototype,"loadingMessage",void 0),H([(0,r.SB)()],j.prototype,"subMessage",void 0),H([(0,r.SB)()],j.prototype,"paymentState",void 0),j=H([(0,d.Mo)("w3m-pay-loading-view")],j);let et={network:"eip155:8453",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},ea={network:"eip155:8453",asset:"0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},en={network:"eip155:84532",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},er={network:"eip155:1",asset:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},ei={network:"eip155:10",asset:"0x0b2c639c533813f4aa9d7837caf62653d097ff85",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},es={network:"eip155:42161",asset:"0xaf88d065e77c8cC2239327C5EDb3A432268e5831",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},eo={network:"eip155:137",asset:"0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},ec={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},el={network:"eip155:1",asset:"0xdAC17F958D2ee523a2206206994597C13D831ec7",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},eu={network:"eip155:10",asset:"0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},ed={network:"eip155:42161",asset:"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},ep={network:"eip155:137",asset:"0xc2132d05d31c914a87c6611c10748aeb04b58e8f",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},em={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},ey={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"native",metadata:{name:"Solana",symbol:"SOL",decimals:9}}},61581:(e,t,a)=>{var n=a(37207),r=a(90670),i=a(83479);a(35300);var s=a(10820),o=a(18322),c=a(30955);let l=(0,c.iv)`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:e})=>e.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var u=function(e,t,a,n){var r,i=arguments.length,s=i<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,a):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,a,n);else for(var o=e.length-1;o>=0;o--)(r=e[o])&&(s=(i<3?r(s):i>3?r(t,a,s):r(t,a))||s);return i>3&&s&&Object.defineProperty(t,a,s),s};let d=class extends n.oi{constructor(){super(...arguments),this.icon="card",this.variant="primary",this.type="accent",this.size="md",this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return(0,n.dy)`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${(0,i.o)(this.iconSize)}></wui-icon>
    </button>`}};d.styles=[s.ET,s.ZM,l],u([(0,r.Cb)()],d.prototype,"icon",void 0),u([(0,r.Cb)()],d.prototype,"variant",void 0),u([(0,r.Cb)()],d.prototype,"type",void 0),u([(0,r.Cb)()],d.prototype,"size",void 0),u([(0,r.Cb)()],d.prototype,"iconSize",void 0),u([(0,r.Cb)({type:Boolean})],d.prototype,"fullWidth",void 0),u([(0,r.Cb)({type:Boolean})],d.prototype,"disabled",void 0),d=u([(0,o.M)("wui-icon-button")],d)},17035:(e,t,a)=>{a(68865)}};