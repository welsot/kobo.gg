namespace api.Modules.Common.Repository;

public interface IRepository<in T>
{
    void Add(T entity);
}