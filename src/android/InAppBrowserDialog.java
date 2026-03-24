package org.apache.cordova.inappbrowser;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.view.Gravity;
import android.widget.FrameLayout;

public class InAppBrowserDialog {
    private final Context context;
    private final FrameLayout dialogContainer;
    private View contentView;
    boolean isVisible = false;

    public InAppBrowserDialog(Context context) {
        this.context = context;

        dialogContainer = new FrameLayout(context);
        updateDisplayMode(false);
    }

    public void setContentView(View contentView) {
        this.contentView = contentView;
        dialogContainer.removeAllViews();
        dialogContainer.addView(contentView);
        updateDisplayMode(false);
    }

    public void setCollapsed(boolean collapsed) {
        updateDisplayMode(collapsed);
    }

    public void show(Boolean animated) {
        if (!isVisible) {
            if (dialogContainer.getParent() == null) {
                if (animated) {
                    dialogContainer.setTranslationY(dpToPx(40));
                    dialogContainer.setAlpha(0);

                    dialogContainer.animate()
                            .alpha(1)
                            .translationY(0)
                            .setDuration(150)
                            .setListener(null);
                }

                ViewGroup rootView = ((ViewGroup) ((android.app.Activity) context).getWindow().getDecorView().getRootView());
                rootView.addView(dialogContainer);
            }

            isVisible = true;
            dialogContainer.setVisibility(View.VISIBLE);
        }
    }

    public void hide() {
        if (isVisible) {
            isVisible = false;
            dialogContainer.setVisibility(View.GONE);
        }
    }

    public void dismiss(Boolean animated) {
        if (isVisible && animated) {
            dialogContainer.animate()
                    .alpha(0)
                    .translationY(dpToPx(40))
                    .setDuration(150)
                    .withEndAction(new Runnable() {
                        @Override
                        public void run() {
                            isVisible = false;
                            dismiss(true);
                        }
                    });
            return;
        }
        isVisible = false;
        dialogContainer.removeAllViews();

        ViewGroup rootView = ((ViewGroup) ((android.app.Activity) context).getWindow().getDecorView().getRootView());
        if (rootView != null && dialogContainer.getParent() != null) {
            rootView.removeView(dialogContainer);
        }
    }

    public View getView() {
        return dialogContainer;
    }

    private void updateDisplayMode(boolean collapsed) {
        int width = collapsed ? ViewGroup.LayoutParams.WRAP_CONTENT : ViewGroup.LayoutParams.MATCH_PARENT;
        int height = collapsed ? ViewGroup.LayoutParams.WRAP_CONTENT : ViewGroup.LayoutParams.MATCH_PARENT;
        int gravity = collapsed ? Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL : Gravity.NO_GRAVITY;

        updateLayoutParams(dialogContainer, width, height, gravity);
        if (contentView != null) {
            updateLayoutParams(contentView, width, height, gravity);
        }
    }

    private void updateLayoutParams(View view, int width, int height, int gravity) {
        FrameLayout.LayoutParams params = view.getLayoutParams() instanceof FrameLayout.LayoutParams
                ? (FrameLayout.LayoutParams) view.getLayoutParams()
                : new FrameLayout.LayoutParams(width, height);
        params.width = width;
        params.height = height;
        params.gravity = gravity;
        view.setLayoutParams(params);
    }

    private float dpToPx(int dp) {
        return dp * context.getResources().getDisplayMetrics().density;
    }
}
