<template>
  <view class="scene">
    <view class="covers">
      <image class="cover cover--back" src="/static/brand/cover-star-courier.jpg" mode="aspectFill" />
      <image class="cover cover--front" src="/static/brand/cover-frost-harbor.jpg" mode="aspectFill" />
    </view>
    <view class="editor-preview">
      <view class="editor-header">
        <view class="editor-dots">
          <view />
          <view />
          <view />
        </view>
        <text>第七章 · 她从雾里来</text>
      </view>
      <view class="manuscript">
        <text>雨是在傍晚六点停的。</text>
        <text>沈砚推开旧钟表店的门，檐角最后一滴水恰好落在他肩上。</text>
        <text>“你还记得我吗？”她问。</text>
      </view>
      <view class="editor-hint">
        <text class="editor-hint__label">创作建议</text>
        <text>保持悬疑，不要提前解释顾遥的身份。</text>
      </view>
    </view>
    <text class="scene-note">示例内容，仅供参考</text>
  </view>
</template>

<style lang="scss" scoped>
.scene {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-top: 8rpx;

  .covers {
    display: flex;
    justify-content: center;
    height: 300rpx;
  }

  .cover {
    box-sizing: border-box;
    width: 216rpx;
    height: 300rpx;
    overflow: hidden;
    border: 6rpx solid var(--paper-bright);
    border-radius: 24rpx;
    box-shadow: var(--shadow-float);

    &--back {
      transform: translate(28rpx, 16rpx) rotate(-6deg);
    }

    &--front {
      z-index: 1;
      transform: translate(-28rpx, 0) rotate(4deg);
    }
  }

  .editor-preview {
    padding: 24rpx 28rpx 28rpx;
    background: var(--paper-bright);
    border: 1px solid var(--line);
    border-radius: 32rpx;
    box-shadow: var(--shadow-float);
  }

  .editor-header {
    display: flex;
    gap: 16rpx;
    align-items: center;
    padding-bottom: 18rpx;
    font-size: 24rpx;
    font-weight: 600;
    border-bottom: 1px solid var(--line);
  }

  .editor-dots {
    display: flex;
    gap: 8rpx;
  }

  .editor-dots view {
    width: 14rpx;
    height: 14rpx;
    background: var(--line-strong);
    border-radius: 50%;
  }

  .manuscript text {
    display: block;
    margin-top: 18rpx;
    font-family: "Songti SC", STSong, serif;
    font-size: 27rpx;
    line-height: 1.75;
  }

  .editor-hint {
    display: flex;
    gap: 16rpx;
    align-items: baseline;
    padding: 18rpx 22rpx;
    margin-top: 24rpx;
    font-size: 23rpx;
    line-height: 1.5;
    color: var(--ink-muted);
    background: var(--accent-wash);
    border-radius: 20rpx;
  }

  .editor-hint__label {
    flex-shrink: 0;
    font-size: 20rpx;
    font-weight: 600;
    color: var(--accent);
  }

  .scene-note {
    font-size: 20rpx;
    color: var(--ink-faint);
    text-align: center;
  }
}
</style>
