import { createTaskAction } from "@/app/actions";

export function CreateTaskForm({ defaultOwner }: { defaultOwner: string }) {
  return (
    <form action={createTaskAction} className="form-stack">
      <div className="field">
        <label htmlFor="new-title">Tiêu đề</label>
        <input
          id="new-title"
          name="title"
          placeholder="VD: Hoàn thiện phần so sánh công nghệ"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="new-description">Mô tả</label>
        <textarea
          id="new-description"
          name="description"
          placeholder="Mô tả ngắn gọn công việc cần làm"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="new-owner">Người phụ trách</label>
        <input
          id="new-owner"
          name="owner"
          placeholder={defaultOwner}
          defaultValue={defaultOwner}
        />
      </div>
      <div className="field">
        <label htmlFor="new-due-date">Hạn hoàn thành</label>
        <input id="new-due-date" name="dueDate" type="date" required />
      </div>
      <div className="field">
        <label htmlFor="new-priority">Mức ưu tiên</label>
        <select id="new-priority" name="priority" defaultValue="medium">
          <option value="low">Thấp</option>
          <option value="medium">Vừa</option>
          <option value="high">Cao</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="new-tags">Tag</label>
        <input
          id="new-tags"
          name="tags"
          placeholder="Demo, Nộp bài, Báo cáo"
        />
      </div>
      <button className="primary-button" type="submit">
        Thêm công việc
      </button>
    </form>
  );
}
