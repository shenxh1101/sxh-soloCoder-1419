import type { KnowledgeNode, MindmapContent, MindmapBranch } from '@/types';
import { NODE_COLORS } from '@/types';

interface MindMapNodeProps {
  node: KnowledgeNode;
}

function BranchItem({
  branch,
  color,
  depth,
}: {
  branch: MindmapBranch;
  color: string;
  depth: number;
}) {
  const childColor = branch.color || NODE_COLORS[(depth + 1) % NODE_COLORS.length];
  const hasChildren = branch.children && branch.children.length > 0 && depth < 2;

  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col items-center pt-3">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: color }}
        />
        {hasChildren && (
          <div
            className="w-px flex-1 mt-1"
            style={{ backgroundColor: `${color}40` }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-xs py-1.5 px-2.5 rounded-lg inline-block border"
          style={{
            backgroundColor: `${color}15`,
            borderColor: `${color}30`,
            color,
          }}
        >
          <span className="font-medium truncate block max-w-[180px]">
            {branch.text}
          </span>
        </div>
        {hasChildren && (
          <div className="mt-2 space-y-1.5 ml-1 pl-3 border-l" style={{ borderColor: `${color}20` }}>
            {branch.children!.slice(0, 4).map((child) => (
              <BranchItem
                key={child.id}
                branch={child}
                color={childColor}
                depth={depth + 1}
              />
            ))}
            {branch.children!.length > 4 && (
              <p className="text-xs text-garden-muted pl-1">
                +{branch.children!.length - 4} 更多
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MindMapNode({ node }: MindMapNodeProps) {
  const content = node.content as MindmapContent;
  const branches = content.branches || [];

  return (
    <div className="space-y-3">
      <div
        className="text-center py-3 px-4 rounded-xl border-2"
        style={{
          backgroundColor: `${node.color}20`,
          borderColor: `${node.color}50`,
        }}
      >
        <p
          className="text-sm font-semibold truncate"
          style={{ color: node.color }}
        >
          {content.rootText || '中心主题'}
        </p>
      </div>

      {branches.length > 0 ? (
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
          {branches.slice(0, 6).map((branch, idx) => {
            const branchColor = branch.color || NODE_COLORS[idx % NODE_COLORS.length];
            return (
              <BranchItem
                key={branch.id}
                branch={branch}
                color={branchColor}
                depth={0}
              />
            );
          })}
          {branches.length > 6 && (
            <p className="text-xs text-garden-muted text-center pt-1">
              +{branches.length - 6} 个分支
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-garden-muted">暂无分支</p>
        </div>
      )}
    </div>
  );
}
