jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const noop = () => undefined;
const identity = (value) => value;

jest.mock("react-native-worklets", () => ({
  WorkletsModule: {
    installTurboModule: noop,
    start: noop,
  },
  callMicrotasks: noop,
  createSerializable: identity,
  createShareable: identity,
  createSynchronizable: identity,
  createWorkletRuntime: identity,
  executeOnUIRuntimeSync: noop,
  getDynamicFeatureFlag: () => false,
  getRuntimeKind: () => "rn-runtime",
  getStaticFeatureFlag: () => false,
  getUISchedulerHolder: () => ({}),
  getUIRuntimeHolder: () => null,
  isBundleModeEnabled: () => false,
  isRNRuntime: () => true,
  isSerializableRef: () => false,
  isShareable: () => false,
  isShareableRef: () => false,
  isSynchronizable: () => false,
  isUIRuntime: () => false,
  isWorkerRuntime: () => false,
  isWorkletFunction: () => false,
  isWorkletRuntime: () => false,
  makeShareable: identity,
  makeShareableCloneOnUIRecursive: identity,
  makeShareableCloneRecursive: identity,
  registerCustomSerializable: noop,
  runOnJS: noop,
  runOnRuntime: noop,
  runOnRuntimeAsync: noop,
  runOnRuntimeAsyncWithId: noop,
  runOnUI: noop,
  runOnUIAsync: noop,
  runOnUISync: noop,
  scheduleOnRN: noop,
  scheduleOnUI: noop,
  serializableMappingCache: {
    set: noop,
    get: () => undefined,
  },
  setDynamicFeatureFlag: noop,
  toggleSlowAnimationsOnUIRuntime: () => false,
}));

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

require("react-native-gesture-handler/jestSetup");
