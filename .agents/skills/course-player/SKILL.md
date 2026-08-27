---
name: course-player
description: >-
  Use this skill when developing or refining the learning interface, YouTube video player,
  curriculum navigation, lesson completion tracking, and student learning experience.
---

# Course Player & Learning Interface Runbook

Follow these instructions when building the student learning player in `learning-management-system-front-end/`:

## 1. Video Player Component Setup
- Embed YouTube videos using privacy-enhanced iframe embeds or the YouTube IFrame API.
- Support standard YouTube URL formats (standard watch URLs, short youtu.be URLs, or embed URLs).
- Ensure the video container has an exact `16:9` ratio with `aspect-video w-full rounded-xl overflow-hidden shadow-sm`.

```jsx
export function YouTubePlayer({ videoUrl, onEnded }) {
  // Extract video ID safely
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  if (!videoId) {
    return <div className="aspect-video bg-zinc-900 text-zinc-400 flex items-center justify-center">No video available</div>;
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`}
        title="Lesson Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
```

## 2. Curriculum Sidebar & Progress Synchronization
- Display modules and lessons hierarchically in a sidebar.
- Clearly differentiate:
  - Current active lesson (accent background + indicator).
  - Completed lessons (check icon + muted title).
  - Incomplete/pending lessons.
- Provide a clear "Mark as Completed" button and auto-advance to next lesson option.

## 3. Verification Steps
1. Test with both valid and invalid YouTube URLs to ensure fallback display.
2. Confirm responsive layout behaves correctly on mobile (<768px) and desktop screens.
3. Verify progress updates reflect in the database and don't create duplicate completion entries.
