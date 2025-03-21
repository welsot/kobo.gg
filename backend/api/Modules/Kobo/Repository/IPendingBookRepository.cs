using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using api.Modules.Common.Repository;
using api.Modules.Kobo.Models;

namespace api.Modules.Kobo.Repository;

public interface IPendingBookRepository : IRepository<PendingBook>
{
    Task<PendingBook?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PendingBook> CreateAsync(TmpBookBundle tmpBookBundle, string fileName, string originalFileName, long fileSize, string s3Key, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<PendingBook>> GetByTmpBookBundleIdAsync(Guid tmpBookBundleId, CancellationToken cancellationToken = default);
    
    Task<int> CountExpiredAsync(CancellationToken cancellationToken = default);
    
    Task DeleteExpiredAsync(CancellationToken cancellationToken = default);
    
    Task UpdateKepubS3KeyAsync(Guid pendingBookId, string kepubS3Key, CancellationToken cancellationToken = default);
}