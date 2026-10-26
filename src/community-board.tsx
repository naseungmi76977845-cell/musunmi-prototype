import {Heart, MessageCircle} from 'lucide-react';
import './community-board.css';

export type CommunityBoardPost = {
  id: string;
  title: string;
  category: string;
};

type Tone = 'question' | 'daily' | 'story';

function memoTone(category: string): Tone {
  if (category === '수어 Q&A') return 'question';
  if (category === '표현 나눔') return 'daily';
  if (category === '함께 배워요') return 'story';
  return 'question';
}

function categoryLabel(category: string) {
  if (category === '수어 Q&A') return '질문';
  if (category === '표현 나눔') return '일상';
  if (category === '함께 배워요') return '수어 이야기';
  return category;
}

export function CommunityBoard({
  posts,
  comments,
  liked,
  loading = false,
  onOpen,
}: {
  posts: CommunityBoardPost[];
  comments: Record<string, string[]>;
  liked: string[];
  loading?: boolean;
  onOpen: (id: string) => void;
}) {
  const pinned = posts.slice(0, 3);

  return (
    <section className="community-board" aria-labelledby="community-board-title">
      <div className="community-board-frame">
        <header className="community-board-intro">
          <h2 id="community-board-title">수어로 함께 이야기해요!</h2>
          <p>질문부터 일상까지, 우리의 이야기를 나눠요.</p>
        </header>

        {loading ? (
          <div className="community-board-state" role="status" aria-live="polite">
            <span className="community-board-spinner" aria-hidden="true" />
            <p>게시판을 불러오는 중이에요.</p>
          </div>
        ) : pinned.length === 0 ? (
          <div className="community-board-state" role="status">
            <p>아직 붙어 있는 이야기가 없어요.</p>
            <small>아래 목록에서 첫 이야기를 남겨 보세요.</small>
          </div>
        ) : (
          <div className="community-board-notes" role="list">
            {pinned.map(post => {
              const tone = memoTone(post.category);
              const commentCount = comments[post.id]?.length ?? 0;
              const isLiked = liked.includes(post.id);
              const showHeart = commentCount === 0 && isLiked;

              return (
                <button
                  key={post.id}
                  type="button"
                  role="listitem"
                  className={`community-memo community-memo-${tone}`}
                  onClick={() => onOpen(post.id)}
                  aria-label={`${categoryLabel(post.category)}. ${post.title}. ${showHeart ? '공감함' : `댓글 ${commentCount}`}`}
                >
                  <span className="community-memo-pin" aria-hidden="true" />
                  <span className="community-memo-category">{categoryLabel(post.category)}</span>
                  <strong className="community-memo-title">{post.title}</strong>
                  <span className="community-memo-meta">
                    {showHeart ? (
                      <>
                        <Heart size={12} strokeWidth={2} aria-hidden="true" fill="currentColor" />
                        공감
                      </>
                    ) : (
                      <>
                        <MessageCircle size={12} strokeWidth={2} aria-hidden="true" />
                        댓글 {commentCount}
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
