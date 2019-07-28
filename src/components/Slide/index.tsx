// Libraries
import * as React from 'react';

// Dependencies
import {
  EActionTypes,
} from '../../typings/definitions';
import {
  ISlideProps,
} from './typings';
import { SliderContext } from '../Context';

// Components
import ExtendedThemeProvider from '../ExtendedThemeProvider';
import { StyledSlide } from './styled-components';
import Background from './Background';
import Mask from './Mask';

let slideUniqueIdsArray: number[] = [];

const generateNewSlideId = (): number => {
  const newSlideId = slideUniqueIdsArray.length + 1;
  slideUniqueIdsArray.push(newSlideId);
  return newSlideId;
};

const removeSlideId = (removedSlideId: number): void => {
  slideUniqueIdsArray = slideUniqueIdsArray.filter(slideId => removedSlideId !== slideId);
};

const { useContext, useEffect, useState, memo } = React;

const HeroSlide = memo((props: ISlideProps) => {
  const {
    shouldRenderMask,
    style,
    background,
    onBackgroundLoad,
    children,
    navDescription,
  } = props;

  const { dispatchProps, slidesArray, slideProps } = useContext(SliderContext);

  const [slideNumber, setSlideNumber] = useState<number>(slidesArray.length);

  const currentSlideData = slidesArray.find(({ slideNumber: number }) => number === slideNumber);

  useEffect(
    () => {
      if (
        dispatchProps &&
        !currentSlideData
      ) {
        // TODO Generate unique IDs.
        const newSlideNumber = generateNewSlideId();
        console.log('slideUniqueIdsArray', slideUniqueIdsArray);
        dispatchProps({
          type: EActionTypes.SET_SLIDE_DATA,
          payload: {
            navDescription,
            slideNumber: newSlideNumber,
          },
        });
        setSlideNumber(newSlideNumber);
      }
    },
    [dispatchProps, currentSlideData, slideNumber, slidesArray, navDescription],
  );

  // When unmounting, remove the slideNumber.
  useEffect(
    () => {
      return () => {
        if (slideNumber) removeSlideId(slideNumber);
      };
    },
    [slideNumber],
  );

  /**
   * CSS variables for the transitions.
   */
  const CSSVariables = React.useMemo(
    () => {
      return background ? {
        '--background-animation-duration': (
          background.backgroundAnimationDuration ?
            `${background.backgroundAnimationDuration}ms` :
            undefined
        ),
        '--background-animation-delay': (
          background.backgroundAnimationDelay ?
            `${background.backgroundAnimationDelay}ms` :
            undefined
        ),
      } : background;
    },
    [background],
  );

  if (
    !currentSlideData ||
    !slideProps
  ) return null;

  const {
    activeSlide,
    isDoneSliding,
    slidingAnimation,
  } = slideProps;

  const currentSlide = slidesArray.indexOf(currentSlideData) + 1;
  const isActive = activeSlide === currentSlide;

  return (
    <ExtendedThemeProvider
      extendedTheme={CSSVariables}
    >
      <StyledSlide
        style={{
          ...style,
          ...CSSVariables,
        }}
          isActive={isActive}
          isDoneSliding={isDoneSliding}
          slidingAnimation={slidingAnimation}
        >
          <Background
            onLoad={onBackgroundLoad}
            {...background} />
          <div className="slide-wrapper">
            {/* Inner Mask */}
            {shouldRenderMask ? (
              <Mask
                background={background}
                isActive={isActive}
                isDoneSliding={isDoneSliding} />
            ) : null}
            {/* Container */}
            {children && (
              <div
              className={[
                'slide-container',
                (isActive && isDoneSliding) ? 'slide-active' : null,
              ].join(' ')}>
              {children}
              </div>
            )}
          </div>
      </StyledSlide>
    </ExtendedThemeProvider>
  );
});

export const Slide = (props: ISlideProps): JSX.Element => <HeroSlide {...props} />;
(Slide as React.FunctionComponent).displayName = 'hero-slider/slide';
