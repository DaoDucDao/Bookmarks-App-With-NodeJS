import { useState } from 'react';
import { type Bookmark } from '../api/bookmarks';
import BookmarkRowDisplay from './BookmarkRow/BookmarkRowDisplay';
import BookmarkRowEditForm from './BookmarkRow/BookmarkRowEditForm';

type Props = {
   bookmark: Bookmark;
   loadBookmarks: () => Promise<void>;
   loadTags: () => Promise<void>;
};

const BookmarkRow = ({ bookmark, loadBookmarks, loadTags }: Props) => {
   const [editing, setEditing] = useState(false);

   if (editing)
      return (
         <BookmarkRowEditForm
            bookmark={bookmark}
            loadBookmarks={loadBookmarks}
            loadTags={loadTags}
            setEditing={setEditing}
         />
      );

   return (
      <BookmarkRowDisplay
         bookmark={bookmark}
         loadBookmarks={loadBookmarks}
         setEditing={setEditing}
      />
   );
};

export default BookmarkRow;
