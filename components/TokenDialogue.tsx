import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import {
  erc20ABI,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useNetwork,
} from "wagmi";
import {
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { etherscanBlockExplorers } from "@wagmi/core";
import { NextImage } from "./NextImage";
import { shortenName } from "./Token";
import { BigNumber } from "ethers";

export const TokenDialog = ({
  open,
  dialogue,
  setDialogue,
}: {
  open: boolean;
  dialogue: {
    address: string;
    open: boolean;
    icon_url: string;
    name: string;
    symbol: string;
    amount: number;
    value: number;
  };
  setDialogue: ({
    open,
    icon_url,
    name,
    symbol,
    amount,
    value,
  }: {
    address: string;
    open: boolean;
    icon_url: string;
    name: string;
    symbol: string;
    amount: number;
    value: number;
  }) => void;
}) => {
  const [address, setAddress] = useState<`0x${string}`>("0x");
  const [value, setValue] = useState<BigNumber>(BigNumber.from("0"));

  const { chain } = useNetwork();

  const cancelButtonRef = useRef(null);
  const { config } = usePrepareContractWrite({
    address: dialogue.address,
    abi: erc20ABI,
    functionName: "transfer",
    args: [address, value],
    enabled: Boolean(address),
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={() => {
          setDialogue({ ...dialogue, open: false });
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                {isLoading && (
                  <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon
                          className="h-5 w-5 text-yellow-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Is Loading...{" "}
                          <a
                            href={
                              chain &&
                              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                              //@ts-expect-error
                              `${etherscanBlockExplorers[chain.name]}/${
                                data?.hash
                              }`
                            }
                            target="_blank"
                            className="font-medium text-yellow-700 underline hover:text-yellow-600"
                            rel="noreferrer"
                          >
                            Etherscan tx link
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {isSuccess && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon
                          className="h-5 w-5 text-green-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Successfully uploaded
                        </p>
                      </div>
                      <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                          <button
                            type="button"
                            className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                          >
                            <span className="sr-only">Dismiss</span>
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                    {dialogue.icon_url && dialogue.name ? (
                      <NextImage
                        width={32}
                        height={32}
                        useBlur={false}
                        src={dialogue.icon_url}
                        className="border-contrast-lower h-full w-full rounded-full border"
                        alt={dialogue.name}
                      />
                    ) : (
                      <span className="border-contrast-lower bg-bg-light inline-flex h-full w-full items-center justify-center rounded-full border">
                        <span className="text-contrast-low overflow-hidden text-ellipsis text-xs leading-none">
                          {dialogue.name && shortenName(dialogue.name)}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Send {dialogue.name} ({dialogue.symbol})
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You have {dialogue.amount} {dialogue.symbol} worth $
                        {dialogue.value}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                    onClick={() => write && write()}
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                    onClick={() => setDialogue({ ...dialogue, open: false })}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};