import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createStackNavigation } from './StackNavigation';

describe('StackNavigation Component Tests', () => {
  const user = userEvent.setup();

  describe('when entries is not provided', () => {
    // arrange
    const [StackNavigation] = createStackNavigation('StackNavigation', { entries: undefined });

    it('should not render Entry when initialStack is not provided', () => {
      // act
      render(
        <StackNavigation>
          <StackNavigation.Entry value={'entry'}>entry</StackNavigation.Entry>
        </StackNavigation>,
      );

      // assert
      expect(screen.queryByText('entry')).not.toBeInTheDocument();
    });

    it("should not render Entry when initialStack is ['test'] and there is no 'test' Entry", () => {
      // act
      render(
        <StackNavigation initialStack={['test']}>
          <div data-testid={'wrapper'}>
            <StackNavigation.Entry value={'entry'}>entry</StackNavigation.Entry>
          </div>
        </StackNavigation>,
      );

      // assert
      expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement();
    });
  });

  describe("when entries is ['first', 'second', 'third'] as const", () => {
    // arrange
    const entries = ['first', 'second', 'third'] as const;
    const [StackNavigation] = createStackNavigation('StackNavigation', { entries });

    describe('Entry tests', () => {
      it('should render other components even when there is no Entry in StackNavigation', () => {
        // act
        render(
          <StackNavigation>
            <div>other</div>
          </StackNavigation>,
        );

        // assert
        expect(screen.getByText('other')).toBeInTheDocument();
      });

      it('should render multiple Entries with the same value', () => {
        // act
        render(
          <StackNavigation>
            <StackNavigation.Entry value={'first'}>first one</StackNavigation.Entry>
            <StackNavigation.Entry value={'first'}>second one</StackNavigation.Entry>
          </StackNavigation>,
        );

        // assert
        expect(screen.getByText('first one')).toBeInTheDocument();
        expect(screen.getByText('second one')).toBeInTheDocument();
      });
    });

    describe('on initial render', () => {
      it("should render 'first' (entries[0]) when initialStack is not provided", () => {
        // act
        render(
          <StackNavigation>
            {entries.map(entry => (
              <StackNavigation.Entry value={entry} key={entry}>
                {entry}
              </StackNavigation.Entry>
            ))}
          </StackNavigation>,
        );

        // assert
        expect(screen.getByText('first')).toBeInTheDocument();
      });

      it("should render 'second' when initialStack is ['second']", () => {
        // act
        render(
          <StackNavigation initialStack={['second']}>
            <StackNavigation.Entry value={'first'}>first</StackNavigation.Entry>
            <StackNavigation.Entry value={'second'}>second</StackNavigation.Entry>
            <StackNavigation.Entry value={'third'}>third</StackNavigation.Entry>
          </StackNavigation>,
        );

        // assert
        expect(screen.queryByText('first')).not.toBeInTheDocument();
        expect(screen.getByText('second')).toBeInTheDocument();
        expect(screen.queryByText('third')).not.toBeInTheDocument();
      });
    });

    describe('push tests', () => {
      it("should render 'second' when stack is ['first'] and 'second' is pushed", async () => {
        // arrange
        render(
          <StackNavigation initialStack={['first']}>
            <div data-testid={'wrapper'}>
              <StackNavigation.Entry value={'first'}>first</StackNavigation.Entry>
              <StackNavigation.Entry value={'second'}>second</StackNavigation.Entry>
              <StackNavigation.Entry value={'third'}>third</StackNavigation.Entry>
            </div>
            <StackNavigation.Trigger>
              {({ push }) => (
                <button type='button' onClick={() => push('second')}>
                  push
                </button>
              )}
            </StackNavigation.Trigger>
          </StackNavigation>,
        );

        // act
        await act(async () => {
          await user.click(screen.getByText('push'));
        });

        // assert
        expect(screen.queryByText('first')).not.toBeInTheDocument();
        expect(screen.getByText('second')).toBeInTheDocument();
      });

      it("should render 'first' when stack is ['first'] and 'first' is pushed", async () => {
        // arrange
        render(
          <StackNavigation initialStack={['first']}>
            <div data-testid={'wrapper'}>
              <StackNavigation.Entry value={'first'}>first</StackNavigation.Entry>
              <StackNavigation.Entry value={'second'}>second</StackNavigation.Entry>
              <StackNavigation.Entry value={'third'}>third</StackNavigation.Entry>
            </div>
            <StackNavigation.Trigger>
              {({ push }) => (
                <button type='button' onClick={() => push('first')}>
                  push
                </button>
              )}
            </StackNavigation.Trigger>
          </StackNavigation>,
        );

        // act
        await act(async () => {
          await user.click(screen.getByText('push'));
        });

        // assert
        expect(screen.getByText('first')).toBeInTheDocument();
        expect(screen.queryByText('second')).not.toBeInTheDocument();
        expect(screen.queryByText('third')).not.toBeInTheDocument();
      });
    });

    describe('pop tests', () => {
      it('should not render anything when pop is called on an empty stack', async () => {
        // arrange
        render(
          <StackNavigation initialStack={[]}>
            <div data-testid={'wrapper'}>
              <StackNavigation.Entry value={'first'}>first</StackNavigation.Entry>
              <StackNavigation.Entry value={'second'}>second</StackNavigation.Entry>
              <StackNavigation.Entry value={'third'}>third</StackNavigation.Entry>
            </div>
            <StackNavigation.Trigger>
              {({ pop }) => (
                <button type='button' onClick={() => pop()}>
                  pop
                </button>
              )}
            </StackNavigation.Trigger>
          </StackNavigation>,
        );

        // act
        await act(async () => {
          await user.click(screen.getByText('pop'));
        });

        // assert
        expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement();
      });

      it("should render 'first' when stack is ['first', 'third'] and pop is called", async () => {
        // arrange
        render(
          <StackNavigation initialStack={['first', 'third']}>
            <div data-testid={'wrapper'}>
              <StackNavigation.Entry value={'first'}>first</StackNavigation.Entry>
              <StackNavigation.Entry value={'second'}>second</StackNavigation.Entry>
              <StackNavigation.Entry value={'third'}>third</StackNavigation.Entry>
            </div>
            <StackNavigation.Trigger>
              {({ pop }) => (
                <button type='button' onClick={() => pop()}>
                  pop
                </button>
              )}
            </StackNavigation.Trigger>
          </StackNavigation>,
        );

        // act
        await act(async () => {
          await user.click(screen.getByText('pop'));
        });

        // assert
        expect(screen.queryByText('third')).not.toBeInTheDocument();
        expect(screen.getByText('first')).toBeInTheDocument();
      });
    });

    describe('clear tests', () => {
      it('should not render anything when clear is called on an empty stack', async () => {
        // arrange
        render(
          <StackNavigation initialStack={[]}>
            <div data-testid={'wrapper'}>
              <StackNavigation.Entry value={'first'}>first</StackNavigation.Entry>
              <StackNavigation.Entry value={'second'}>second</StackNavigation.Entry>
              <StackNavigation.Entry value={'third'}>third</StackNavigation.Entry>
            </div>
            <StackNavigation.Trigger>
              {({ clear }) => (
                <button type='button' onClick={clear}>
                  clear
                </button>
              )}
            </StackNavigation.Trigger>
          </StackNavigation>,
        );

        // act
        await act(async () => {
          await user.click(screen.getByText('clear'));
        });

        // assert
        expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement();
      });

      it("should not render anything when stack is ['first', 'third'] and clear is called", async () => {
        // arrange
        render(
          <StackNavigation initialStack={['first', 'third']}>
            <div data-testid={'wrapper'}>
              <StackNavigation.Entry value={'first'}>first</StackNavigation.Entry>
              <StackNavigation.Entry value={'second'}>second</StackNavigation.Entry>
              <StackNavigation.Entry value={'third'}>third</StackNavigation.Entry>
            </div>
            <StackNavigation.Trigger>
              {({ clear }) => (
                <button type='button' onClick={clear}>
                  clear
                </button>
              )}
            </StackNavigation.Trigger>
          </StackNavigation>,
        );

        // act
        await act(async () => {
          await user.click(screen.getByText('clear'));
        });

        // assert
        expect(screen.getByTestId('wrapper')).toBeEmptyDOMElement();
      });
    });

    describe('DynamicEntry tests', () => {
      it("should render 'second' when initialStack is ['second']", () => {
        // arrange
        render(
          <StackNavigation initialStack={['second']}>
            <StackNavigation.DynamicEntry>{entry => <div>{entry}</div>}</StackNavigation.DynamicEntry>
          </StackNavigation>,
        );

        // assert
        expect(screen.getByText('second')).toBeInTheDocument();
      });

      it('should render the last value in the stack', async () => {
        // arrange
        render(
          <StackNavigation initialStack={['second']}>
            <StackNavigation.DynamicEntry data-testid={'dynamic-entry'}>
              {entry => <div>{entry}</div>}
            </StackNavigation.DynamicEntry>
            <StackNavigation.Trigger>
              {({ push, pop, clear }) => (
                <>
                  <button type='button' onClick={() => push('first')}>
                    push 1
                  </button>
                  <button type='button' onClick={() => push('second')}>
                    push 2
                  </button>
                  <button type='button' onClick={() => push('third')}>
                    push 3
                  </button>
                  <button type='button' onClick={() => pop()}>
                    pop
                  </button>
                  <button type='button' onClick={() => clear()}>
                    clear
                  </button>
                </>
              )}
            </StackNavigation.Trigger>
          </StackNavigation>,
        );

        // act
        await act(async () => {
          await user.click(screen.getByText('push 1'));
        });

        // assert
        expect(screen.getByText('first')).toBeInTheDocument();

        // act
        await act(async () => {
          await user.click(screen.getByText('push 2'));
        });

        // assert
        expect(screen.getByText('second')).toBeInTheDocument();

        // act
        await act(async () => {
          await user.click(screen.getByText('push 3'));
        });

        // assert
        expect(screen.getByText('third')).toBeInTheDocument();

        // act
        await act(async () => {
          await user.click(screen.getByText('pop'));
        });

        // assert
        expect(screen.getByText('second')).toBeInTheDocument();

        // act
        await act(async () => {
          await user.click(screen.getByText('clear'));
        });

        // assert
        expect(screen.queryByTestId('dynamic-entry')).not.toBeInTheDocument();
      });
    });
  });
});
