import { ComponentProps, ComponentType, PropsWithChildren, ReactNode } from 'react';

type GetRequiredKeys<T extends object> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

type IsOptionalProps<T> = T extends ComponentType<infer PROPS>
  ? PROPS extends object
    ? Exclude<GetRequiredKeys<PROPS>, 'children'> extends never
      ? true
      : false
    : true
  : false;

type PartialKeys<T, K> = T extends object ? (K extends keyof T ? Omit<T, K> & Partial<Pick<T, K>> : T) : T;

type PropsWithOptionalChildrenAndRest<T> = T extends object
  ? PartialKeys<PropsWithChildren<T>, 'children'> & Record<PropertyKey, any>
  : T;

type OptionalTuple<T extends [any, any]> = T extends [infer COMPONENT, infer PROPS]
  ? IsOptionalProps<COMPONENT> extends true
    ? [COMPONENT, PropsWithOptionalChildrenAndRest<PROPS>] | [COMPONENT]
    : [COMPONENT, PropsWithOptionalChildrenAndRest<PROPS>]
  : T;

type InferTuple<TUPLES extends ReadonlyArray<[ComponentType<any>, any] | [ComponentType<any>]>> = {
  [INDEX in keyof TUPLES]: TUPLES[INDEX] extends [infer COMPONENT, unknown]
    ? COMPONENT extends ComponentType<infer PROPS>
      ? OptionalTuple<[COMPONENT, PROPS]>
      : OptionalTuple<TUPLES[INDEX]>
    : TUPLES[INDEX]['length'] extends 1
      ? OptionalTuple<[TUPLES[INDEX][0], ComponentProps<TUPLES[INDEX][0]>]>
      : never;
};

const getComponentName = (component: any): string => {
  return component.displayName || component.name;
};

export const Combined = <const T extends ReadonlyArray<[any, any] | [any]>>({
  components,
  children,
}: {
  components: InferTuple<T>;
  children: ReactNode;
}) => {
  return (
    <>
      {(components as Array<[(props: any) => ReactNode, any]>).reduceRight(
        (acc, [Component, props = {}], index) => {
          const componentName = getComponentName(Component);
          return (
            <Component
              key={`${componentName}-${
                // biome-ignore lint/suspicious/noArrayIndexKey: components array is static and won't reorder
                index
              }`}
              {...props}
            >
              {acc}
            </Component>
          );
        },
        <>{children}</>,
      )}
    </>
  );
};
