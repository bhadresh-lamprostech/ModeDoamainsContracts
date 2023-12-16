import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { toBigInt } from "web3-utils";
import {
  deployToolkit,
  registerTLD,
  encodeHookExtraData,
} from "../test-utils/tld";

describe("Discount for 5+ Year Registrants", function () {
  const MIN_PLATFORM_FEE = toBigInt(5 * 1e17); // 0.5 USD
  const PLATFORM_FEE_RATIO = 1500; // 15% = 1500 / 10000

  let TOKEN_ID_1;
  let TOKEN_ID_2;
  const VALUE_1 = toBigInt(1e18); // 1 USD
  const VALUE_2 = toBigInt(1e19); // 10 USD

  const ONE_DAY_DURATION = 86400;
  const ONE_YEAR_DURATION = ONE_DAY_DURATION * 365;
  const USE_GIFTCARD_EXTRA_DATA = encodeHookExtraData("", true);

  let preRegiConfig;
  let publicRegistrationStartTime;
  let oneYearCostInUSD;
  let platformConfig;

  async function deployFixture() {
    const [
      owner,
      platformAdmin,
      platformFeeCollector,
      factory,
      tldOwner,
      mockController,
      addr1,
      addr2,
    ] = await ethers.getSigners();

    const {
      registry,
      sann,
      registrar,
      platformConfig,
      usdOracle,
      tldFactory,
      preRegistrationCreator,
      giftCardLedger,
      giftCardVoucher,
      giftCardController,
      priceOracle,
      discountHook,
      auction,
      preRegiState,
    } = await deployToolkit(
      platformAdmin,
      platformFeeCollector,
      MIN_PLATFORM_FEE,
      PLATFORM_FEE_RATIO
    );

    const ret = await registerTLD(
      sann,
      registry,
      tldFactory,
      "ttt",
      tldOwner,
      platformAdmin,
      registrar,
      preRegistrationCreator
    );
    const identifier = ret.identifier;
    const auctionStartTime = ret.auctionStartTime;

    preRegiConfig = ret.preRegiConfig;
    preRegiConfig.auctionHardEndTime =
      preRegiConfig.auctionInitialEndTime + 86400;
    publicRegistrationStartTime = ret.publicRegistrationStartTime;
    const preRegiDiscountRateBps = ret.preRegiDiscountRateBps;

    const hooks = await registrar.tldHooks(identifier);
    const discountHookAddr = hooks.priceHook;
    const discountHook = await ethers.getContractAt(
      "DefaultDiscountHook",
      discountHookAddr
    );

    await sann.connect(platformAdmin).setTldController(mockController);

    let ret2 = await registrar.rentPrice(identifier, "1234", ONE_YEAR_DURATION);
    let priceInWEI = ret2.base + ret2.premium;
    oneYearCostInUSD = await priceOracle.weiToAttoUSD(priceInWEI);

    TOKEN_ID_1 = await giftCardVoucher
      .connect(tldOwner)
      .addCustomizedVoucher.staticCall(identifier, VALUE_1);
    TOKEN_ID_2 = await giftCardVoucher
      .connect(tldOwner)
      .addCustomizedVoucher.staticCall(identifier, VALUE_2);

    await giftCardVoucher
      .connect(tldOwner)
      .addCustomizedVoucher(identifier, VALUE_1);
    await giftCardVoucher
      .connect(tldOwner)
      .addCustomizedVoucher(identifier, VALUE_2);

    await giftCardController
      .connect(addr1)
      .batchRegister([TOKEN_ID_1, TOKEN_ID_2], [20, 20], {
        value: toBigInt(1e18),
      });
    await giftCardController
      .connect(addr1)
      .batchRedeem(identifier, [TOKEN_ID_1, TOKEN_ID_2], [20, 20]);

    await giftCardController
      .connect(addr2)
      .batchRegister([TOKEN_ID_1, TOKEN_ID_2], [2, 2], {
        value: toBigInt(1e18),
      });

    return {
      sann,
      owner,
      platformFeeCollector,
      factory,
      tldOwner,
      platformAdmin,
      registry,
      platformConfig,
      registrar,
      auction,
      preRegiState,
      mockController,
      giftCardLedger,
      giftCardVoucher,
      giftCardController,
      priceOracle,
      discountHook,
      addr1,
      addr2,
    };
  }

  let mockController;
  let auction;
  let preRegiState;
  let tldOwner;
  let giftCardLedger;
  let giftCardVoucher;
  let giftCardController;
  let registrar;
  let priceOracle;
  let discountHook;
  let addr1;
  let addr2;
  let addr3;
  let addr4;

  describe("Discount for 5+ Year Registrants", function () {
    beforeEach(async function makeAllReady() {
      let ret = await loadFixture(deployFixture);
      discountHook = ret.discountHook;
      mockController = ret.mockController;
      auction = ret.auction;
      addr1 = ret.addr1;
      addr2 = ret.addr2;
      preRegiState = ret.preRegiState;
      tldOwner = ret.tldOwner;
      giftCardLedger = ret.giftCardLedger;
      giftCardVoucher = ret.giftCardVoucher;
      giftCardController = ret.giftCardController;
      registrar = ret.registrar;
      priceOracle = ret.priceOracle;
      platformConfig = ret.platformConfig;

      await preRegiState.connect(tldOwner).setUserQuota(addr1, 2);
      await preRegiState.connect(tldOwner).setUserQuota(addr2, 2);

      ret = await registrar.rentPrice(identifier, "1234", ONE_YEAR_DURATION);
      let priceInWEI = ret.base + ret.premium;
      oneYearCostInUSD = await priceOracle.weiToAttoUSD(priceInWEI);

      await time.increaseTo(preRegiConfig.auctionStartTime + 1);
    });

    it("should apply 20% discount for 5+ year registrants in the first 21 days", async function () {
      const fiveYearsDuration = ONE_YEAR_DURATION * 5;

      const registrationTx = await registrar
        .connect(addr1)
        .register(
          identifier,
          "1234",
          fiveYearsDuration,
          oneYearCostInUSD,
          USE_GIFTCARD_EXTRA_DATA
        );

      const registrationEvent = registrationTx.events.find(
        (event) => event.event === "Registration"
      );

      expect(registrationEvent).to.not.be.undefined;

      const discountedPrice = await discountHook
        .connect(mockController)
        .newPrice.staticCall(
          identifier,
          "1234",
          addr1,
          fiveYearsDuration,
          oneYearCostInUSD,
          USE_GIFTCARD_EXTRA_DATA
        );

      const expectedDiscountedPrice =
        (toBigInt(80) * oneYearCostInUSD) / toBigInt(100);

      expect(discountedPrice).to.be.equal(expectedDiscountedPrice);
    });
  });
});
